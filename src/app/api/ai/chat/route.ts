import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, lang = "ar", conversationId } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Get user's profile and company
    const { data: profile } = await supabase
      .from("profiles")
      .select("*, companies(*)")
      .eq("id", user.id)
      .single();

    const companyId = profile?.company_id || profile?.id;

    // Fetch real data for AI analysis
    const [invoicesRes, clientsRes, productsRes, expensesRes, revenueRes] =
      await Promise.all([
        supabase
          .from("invoices")
          .select("*")
          .eq("company_id", companyId)
          .order("created_at", { ascending: false }),
        supabase
          .from("clients")
          .select("*")
          .eq("company_id", companyId),
        supabase
          .from("products")
          .select("*")
          .eq("company_id", companyId),
        supabase
          .from("expenses")
          .select("*")
          .eq("company_id", companyId)
          .order("expense_date", { ascending: false }),
        supabase
          .from("revenue_entries")
          .select("*")
          .eq("company_id", companyId),
      ]);

    const invoices = invoicesRes.data || [];
    const clients = clientsRes.data || [];
    const products = productsRes.data || [];
    const expenses = expensesRes.data || [];
    const revenues = revenueRes.data || [];

    // Generate AI response based on message content and real data
    const response = generateAIResponse(
      message,
      lang,
      { invoices, clients, products, expenses, revenues, profile }
    );

    return NextResponse.json({
      response: response.text,
      responseAr: lang === "ar" ? response.text : response.text,
      data: response.data,
      conversationId: conversationId || `conv_${user.id}_${Date.now()}`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

function generateAIResponse(
  message: string,
  lang: "ar" | "en",
  data: {
    invoices: any[];
    clients: any[];
    products: any[];
    expenses: any[];
    revenues: any[];
    profile: any;
  }
) {
  const { invoices, clients, products, expenses, revenues, profile } = data;
  const msg = message.toLowerCase();

  const isAr = lang === "ar";

  // Helper to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isAr ? "ar-EG" : "en-EG", {
      style: "currency",
      currency: "EGP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate metrics
  const totalRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + Number(i.total || 0), 0);
  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter((i) => i.status === "paid").length;
  const pendingInvoices = invoices.filter(
    (i) => i.status === "sent" || i.status === "draft"
  ).length;
  const overdueInvoices = invoices.filter((i) => i.status === "overdue").length;
  const totalExpenses = expenses.reduce(
    (sum, e) => sum + Number(e.amount || 0),
    0
  );
  const profit = totalRevenue - totalExpenses;
  const totalClients = clients.length;
  const totalProducts = products.length;

  // Overdue clients
  const overdueClients = clients.filter((c) => Number(c.balance_due || 0) > 0);

  // Low stock products
  const lowStockProducts = products.filter(
    (p) => p.track_inventory && Number(p.current_stock || 0) <= Number(p.min_stock_alert || 5)
  );

  // Top products by revenue (from invoice items)
  const productSales: Record<string, { revenue: number; count: number }> = {};
  invoices.forEach((inv) => {
    const items = Array.isArray(inv.items) ? inv.items : [];
    items.forEach((item: any) => {
      const name = item.name || item.item_name || "Unknown";
      if (!productSales[name]) productSales[name] = { revenue: 0, count: 0 };
      productSales[name].revenue += Number(item.line_total || item.total || 0);
      productSales[name].count += Number(item.quantity || 1);
    });
  });
  const topProducts = Object.entries(productSales)
    .sort(([, a], [, b]) => b.revenue - a.revenue)
    .slice(0, 5);

  // Expense analysis
  const expenseByCategory: Record<string, number> = {};
  expenses.forEach((e) => {
    const cat = e.category || "uncategorized";
    expenseByCategory[cat] = (expenseByCategory[cat] || 0) + Number(e.amount || 0);
  });
  const topExpenseCategory = Object.entries(expenseByCategory)
    .sort(([, a], [, b]) => b - a)[0];

  // Keywords detection (Arabic & English)
  const keywords = {
    performance: ["performance", "أداء", "أداء العمل", "business performance", "تحليل الأداء"],
    profit: ["profit", "ربح", "أرباح", "الإيرادات", "revenue", "sales", "مبيعات"],
    expense: ["expense", "مصروفات", "صرف", "تكاليف", "costs", "تكلفة"],
    overdue: ["overdue", "متأخر", "تأخر", "delayed", "'insured", "ddue"],
    client: ["client", "عميل", "workاء", "customers", "زوار"],
    product: ["product", "منتج", "منتجات", "slothing", "substance"],
    cashflow: ["cash flow", "تدفق نقدي", "seattle", "tوقع", "forecast"],
    recommendation: ["recommend", "نصيحة", "اقترح", "suggest", "نصيحة"],
    anomaly: ["anomaly", "غير طبيعي", "shaz", "unusual", "غير عادي"],
  };

  const contains = (arr: string[]) => arr.some((k) => msg.includes(k));

  // Build response
  if (contains(keywords.performance)) {
    return {
      text: isAr
        ? `إليك تحليل أداء أعمالك:\n\n📊 إجمالي الفواتير: ${totalInvoices}\n💰 إجمالي الإيرادات (مدفوعة): ${formatCurrency(totalRevenue)}\n✅ الفواتير المدفوعة: ${paidInvoices}\n⏳ الفواتير المعلقة: ${pendingInvoices}\n⚠️ الفواتير المتأخرة: ${overdueInvoices}\n📉 إجمالي المصروفات: ${formatCurrency(totalExpenses)}\n🎯 صافي الربح: ${formatCurrency(profit)}\n👥 إجمالي العملاء: ${totalClients}\n📦 إجمالي المنتجات: ${totalProducts}\n\nمعدل تحصيل الفواتير: ${totalInvoices > 0 ? Math.round((paidInvoices / totalInvoices) * 100) : 0}%\n\nهذه البيانات مأخوذة من قاعدة بياناتك الفعلية في Fatora.`
        : `Here's your business performance analysis:\n\n📊 Total invoices: ${totalInvoices}\n💰 Total revenue (paid): ${formatCurrency(totalRevenue)}\n✅ Paid invoices: ${paidInvoices}\n⏳ Pending invoices: ${pendingInvoices}\n⚠️ Overdue invoices: ${overdueInvoices}\n📉 Total expenses: ${formatCurrency(totalExpenses)}\n🎯 Net profit: ${formatCurrency(profit)}\n👥 Total clients: ${totalClients}\n📦 Total products: ${totalProducts}\n\nInvoice collection rate: ${totalInvoices > 0 ? Math.round((paidInvoices / totalInvoices) * 100) : 0}%\n\nAll data is from your actual Fatora database.`,
      data: {
        totalRevenue,
        totalInvoices,
        paidInvoices,
        pendingInvoices,
        overdueInvoices,
        totalExpenses,
        profit,
        totalClients,
        totalProducts,
        collectionRate: totalInvoices > 0 ? Math.round((paidInvoices / totalInvoices) * 100) : 0,
      },
    };
  }

  if (contains(keywords.overdue)) {
    if (overdueClients.length === 0) {
      return {
        text: isAr
          ? "ممتاز! لا يوجد أي عملاء لديهم مدفوعات متأخرة في الوقت الحالي. جميع عملائك ملتزمون بالسداد في الوقت المحدد."
          : "Excellent! No clients have overdue payments at the moment. All your clients are committed to paying on time.",
        data: { overdueClients: [] },
      };
    }

    const overdueAmount = overdueClients.reduce(
      (sum, c) => sum + Number(c.balance_due || 0),
      0
    );

    return {
      text: isAr
        ? `⚠️ يوجد ${overdueClients.length} عميل لديهم مدفوعات متأخرة:\n\n${overdueClients
            .map((c) => `- ${c.name}: ${formatCurrency(Number(c.balance_due || 0))}`)
            .join("\n")}\n\nإجمالي المبلغ المتأخر: ${formatCurrency(overdueAmount)}\n\nأنا أنصحك بإرسال تذكيرات دفع لهذه العملاء عبر واتساب أو البريد الإلكتروني.`
        : `⚠️ ${overdueClients.length} clients have overdue payments:\n\n${overdueClients
            .map((c) => `- ${c.name}: ${formatCurrency(Number(c.balance_due || 0))}`)
            .join("\n")}\n\nTotal overdue amount: ${formatCurrency(overdueAmount)}\n\nI recommend sending payment reminders to these clients via WhatsApp or email.`,
      data: { overdueClients, overdueAmount },
    };
  }

  if (contains(keywords.expense)) {
    const topCatText = topExpenseCategory
      ? isAr
        ? `أعلى فئة مصروفات: ${topExpenseCategory[0]} بمبلغ ${formatCurrency(topExpenseCategory[1])}`
        : `Top expense category: ${topExpenseCategory[0]} at ${formatCurrency(topExpenseCategory[1])}`
      : "";

    return {
      text: isAr
        ? `تحليل المصروفات:\n\nإجمالي المصروفات المسجلة: ${formatCurrency(totalExpenses)}\n${topCatText}\n\nعدد المصروفات: ${expenses.length}\n\nنصيحة: راجع المصروفات المتكررة وحاول التفاوض مع الموردين لتقليل التكاليف الشهرية.`
        : `Expense analysis:\n\nTotal recorded expenses: ${formatCurrency(totalExpenses)}\n${topCatText}\n\nNumber of expenses: ${expenses.length}\n\nTip: Review recurring expenses and negotiate with suppliers to reduce monthly costs.`,
      data: { totalExpenses, expenseCount: expenses.length, topExpenseCategory },
    };
  }

  if (contains(keywords.product)) {
    if (topProducts.length === 0) {
      return {
        text: isAr
          ? "لا توجد بيانات مبيعات للمنتجات بعد. ابدأ بإنشاء فواتير لمنتجاتك لرؤية تحليل المبيعات."
          : "No product sales data yet. Start creating invoices for your products to see sales analysis.",
        data: { topProducts: [] },
      };
    }

    return {
      text: isAr
        ? `أكثر المنتجات ربحية:\n\n${topProducts
            .map(([name, data]) => `- ${name}: ${formatCurrency(data.revenue)} (${data.count} وحدة)`)
            .join("\n")}\n\nهذه المنتجات تمثل أفضل عائد على استثمارك. أنصحك بالتركيز على تسويقها وإدارة مخزونها بعناية.`
        : `Most profitable products:\n\n${topProducts
            .map(([name, data]) => `- ${name}: ${formatCurrency(data.revenue)} (${data.count} units)`)
            .join("\n")}\n\nThese products represent the best return on your investment. I recommend focusing on marketing them and managing their inventory carefully.`,
      data: { topProducts },
    };
  }

  if (contains(keywords.cashflow)) {
    const monthlyRevenue = totalRevenue;
    const monthlyExpenses = totalExpenses;
    const netCashFlow = monthlyRevenue - monthlyExpenses;

    return {
      text: isAr
        ? `توقع التدفق النقدي:\n\nالإيرادات الشهرية المتوقعة: ${formatCurrency(monthlyRevenue)}\nالمصروفات الشهرية المتوقعة: ${formatCurrency(monthlyExpenses)}\nصافي التدفق النقدي: ${formatCurrency(netCashFlow)}\n\n${netCashFlow > 0 ? "الأخبار الجيدة: لديك تدفق نقدي إيجابي." : "انتباه: لديك تدفق نقدي سلبي. انصحك بمراجعة مصروفاتك أو زيادة أسعار خدماتك."}`
        : `Cash flow forecast:\n\nExpected monthly revenue: ${formatCurrency(monthlyRevenue)}\nExpected monthly expenses: ${formatCurrency(monthlyExpenses)}\nNet cash flow: ${formatCurrency(netCashFlow)}\n\n${netCashFlow > 0 ? "Good news: You have positive cash flow." : "Warning: You have negative cash flow. I recommend reviewing your expenses or increasing your service prices."}`,
      data: { monthlyRevenue, monthlyExpenses, netCashFlow },
    };
  }

  if (contains(keywords.recommendation)) {
    const recommendations = [];

    if (overdueInvoices > 0) {
      recommendations.push(isAr ? "تollow up على الفواتير المتأخرة فوراً" : "Follow up on overdue invoices immediately");
    }
    if (lowStockProducts.length > 0) {
      recommendations.push(isAr ? "إعادة طلب المنتجات منخفضة المخزون" : "Reorder low-stock products");
    }
    if (totalExpenses > totalRevenue * 0.8) {
      recommendations.push(isAr ? "مراجعة المصروفات العالية relative للإيرادات" : "Review high expenses relative to revenue");
    }
    if (paidInvoices < totalInvoices * 0.7) {
      recommendations.push(isAr ? "تحسين سياسة تحصيل المدفوعات من العملاء" : "Improve client payment collection policy");
    }

    if (recommendations.length === 0) {
      recommendations.push(isAr ? "أعمالك تسير بشكل جيد، استمر في المراقبة الدورية" : "Your business is doing well, continue regular monitoring");
    }

    return {
      text: isAr
        ? `توصيات لتحسين أرباحك:\n\n${recommendations.map((r, i) => `${i + 1}. ${r}`).join("\n")}\n\nهذه التوصيات مبنية على بياناتك الفعلية في Fatora.`
        : `Recommendations to improve your profits:\n\n${recommendations.map((r, i) => `${i + 1}. ${r}`).join("\n")}\n\nThese recommendations are based on your actual Fatora data.`,
      data: { recommendations },
    };
  }

  if (contains(keywords.anomaly)) {
    const anomalies = [];

    // Detect unusually high expenses
    const avgExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;
    const unusualExpenses = expenses.filter(
      (e) => Number(e.amount || 0) > avgExpense * 2
    );

    if (unusualExpenses.length > 0) {
      anomalies.push({
        type: "unusual_expense",
        text: isAr ? "مصروفات غير طبيعية مكتشفة" : "Unusual expenses detected",
        details: unusualExpenses.map((e) => `${e.title}: ${formatCurrency(Number(e.amount || 0))}`),
      });
    }

    // Detect drop in revenue
    if (totalRevenue === 0 && totalInvoices > 0) {
      anomalies.push({
        type: "no_revenue",
        text: isAr ? "لا توجد إيرادات مسجلة رغم وجود فواتير" : "No revenue recorded despite having invoices",
        details: ["Most invoices are not paid yet"],
      });
    }

    if (anomalies.length === 0) {
      return {
        text: isAr ? "لم يتم اكتشاف أي أنماط غير طبيعية في بياناتك المالية. كل شيء يبدو طبيعياً." : "No unusual patterns detected in your financial data. Everything looks normal.",
        data: { anomalies: [] },
      };
    }

    return {
      text: isAr ? `الشذوذ المكتشف:\n\n${anomalies.map((a) => `⚠️ ${a.text}\n${a.details.join("\n")}`).join("\n\n")}` : `Detected anomalies:\n\n${anomalies.map((a) => `⚠️ ${a.text}\n${a.details.join("\n")}`).join("\n\n")}`,
      data: { anomalies },
    };
  }

  // Default response
  return {
    text: isAr
      ? `أنا مساعدك الذكي في Fatora. يمكنني مساعدتك في:\n\n• تحليل الأداء المالي والأرباح\n• اكتشاف المصروفات غير الطبيعية\n• تحليل المبيعات والمنتجات الأكثر ربحية\n• توقع التدفقات النقدية\n• اكتشاف العملاء المتأخرين في السداد\n• تقديم توصيات لتحسين الأرباح\n\nاسألني عن أي من هذه المواضيع وسأقوم بتحليل بياناتك الفعلية وإعادتك بنتيجة دقيقة.\n\nمثال: "ما هي منتجاتي الأكثر ربحية؟" أو "أي العملاء لديهم مدفوعات متأخرة؟"`
      : `I'm your Fatora AI assistant. I can help you with:\n\n• Financial performance and profit analysis\n• Detecting unusual expenses\n• Sales analysis and most profitable products\n• Cash flow forecasting\n• Detecting clients with overdue payments\n• Recommendations to improve profits\n\nAsk me about any of these topics and I'll analyze your actual data and give you accurate results.\n\nExample: "What are my most profitable products?" or "Which clients have overdue payments?"`,
    data: {},
  };
}