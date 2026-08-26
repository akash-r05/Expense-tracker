import { useEffect, useState } from "react";
import {
  getMonthlyReport,
  getYearlyReport,
} from "./api";

function ReportPage({ userEmail }) {

  const today = new Date();

  const currentYear = today.getFullYear();
  const currentMonth = String(today.getMonth() + 1).padStart(2, "0");

  const [monthlyReport, setMonthlyReport] = useState(null);
  const [yearlyReport, setYearlyReport] = useState([]);
  const [loading, setLoading] = useState(true);

  // ===============================
  // LOAD REPORTS
  // ===============================

  const loadReports = async () => {
    try {
      setLoading(true);

      const month = `${currentYear}-${currentMonth}`;

      const monthlyData = await getMonthlyReport(
        month,
        userEmail
      );

      const yearlyData = await getYearlyReport(
        currentYear,
        userEmail
      );

      setMonthlyReport(monthlyData);
      setYearlyReport(yearlyData || []);

    } catch (error) {
      console.error("Report error:", error);
      alert("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  // ===============================
  // LOADING
  // ===============================

  if (loading) {
    return (
      <div className="report-page">
        <h1>Reports & Analytics</h1>
        <p className="loading-text">
          Loading reports...
        </p>
      </div>
    );
  }

  if (!monthlyReport) {
    return (
      <div className="report-page">
        <h1>Reports & Analytics</h1>
        <p>No report data available.</p>
      </div>
    );
  }

  // ===============================
  // SUMMARY CALCULATIONS
  // ===============================

  const totalExpenses =
    Number(monthlyReport.totalExpenses || 0);

  const totalBudget =
    Number(monthlyReport.totalBudget || 0);

  const budgetPercentage =
    totalBudget > 0
      ? Math.min(
          (totalExpenses / totalBudget) * 100,
          100
        )
      : 0;

  // ===============================
  // MONTH NAME
  // ===============================

  const monthName = new Date(
    currentYear,
    today.getMonth()
  ).toLocaleString("default", {
    month: "long",
  });

  return (
    <div className="report-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="report-header">

        <div>
          <h1>Reports & Analytics</h1>

          <p>
            {monthName} {currentYear}
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={loadReports}
        >
          Refresh Reports
        </button>

      </div>


      {/* =========================
          SUMMARY CARDS
      ========================= */}

      <div className="report-summary">

        <div className="report-summary-card">
          <h3>Total Expenses</h3>

          <strong>
            ₹{totalExpenses.toFixed(2)}
          </strong>
        </div>


        <div className="report-summary-card">
          <h3>Total Budget</h3>

          <strong>
            ₹{totalBudget.toFixed(2)}
          </strong>
        </div>


        <div className="report-summary-card">
          <h3>Budget Used</h3>

          <strong>
            {budgetPercentage.toFixed(1)}%
          </strong>
        </div>


        <div className="report-summary-card">
          <h3>Categories</h3>

          <strong>
            {monthlyReport.categoryTotals?.length || 0}
          </strong>
        </div>

      </div>


      {/* =========================
          CATEGORY REPORT
      ========================= */}

      <div className="report-card">

        <h2>Category-wise Spending</h2>

        {monthlyReport.categoryTotals?.length === 0 ? (

          <p className="empty-report">
            No expenses recorded this month.
          </p>

        ) : (

          <div className="category-report">

            {monthlyReport.categoryTotals.map(
              (category, index) => {

                const amount =
                  Number(category.amount || 0);

                const budget =
                  Number(category.budgetLimit || 0);

                const percentage =
                  budget > 0
                    ? Math.min(
                        (amount / budget) * 100,
                        100
                      )
                    : 0;

                return (
                  <div
                    className="category-report-row"
                    key={index}
                  >

                    <div className="category-report-top">

                      <strong>
                        {category.categoryName}
                      </strong>

                      <span>
                        ₹{amount.toFixed(2)}
                        {" / "}
                        ₹{budget.toFixed(2)}
                      </span>

                    </div>


                    <div className="report-progress">

                      <div
                        className="report-progress-fill"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />

                    </div>


                    <div className="category-percentage">
                      {percentage.toFixed(1)}% of budget
                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

      </div>


      {/* =========================
          BUDGET ALERTS
      ========================= */}

      <div className="report-card">

        <h2>Budget Alerts</h2>

        {monthlyReport.budgetAlerts?.length === 0 ? (

          <p className="empty-report">
            No budget alerts.
          </p>

        ) : (

          monthlyReport.budgetAlerts.map(
            (alert, index) => {

              const amount =
                Number(alert.amount || 0);

              const budget =
                Number(alert.budgetLimit || 0);

              const percentageUsed =
                Number(alert.percentageUsed || 0);

              return (
                <div
                  className={
                    alert.exceeded
                      ? "budget-alert exceeded"
                      : alert.alertTriggered
                        ? "budget-alert warning"
                        : "budget-alert"
                  }
                  key={index}
                >

                  <div>

                    <strong>
                      {alert.categoryName}
                    </strong>

                    <p>
                      Spent ₹{amount.toFixed(2)}
                      {" "}of{" "}
                      ₹{budget.toFixed(2)}
                    </p>

                    <p>
                      {percentageUsed.toFixed(2)}%
                      {" "}of budget used
                    </p>

                  </div>

                  <span>
                    {alert.exceeded
                      ? "Budget Exceeded"
                      : alert.alertTriggered
                        ? "Budget Alert"
                        : "Within Budget"}
                  </span>

                </div>
              );
            }
          )

        )}

      </div>


      {/* =========================
          YEARLY REPORT
      ========================= */}

      <div className="report-card">

        <h2>Yearly Spending</h2>

        <div className="yearly-report">

          {yearlyReport.map(
            (month, index) => {

              const amount =
                Number(month.totalExpenses || 0);

              const budget =
                Number(month.totalBudget || 0);

              const percentage =
                budget > 0
                  ? Math.min(
                      (amount / budget) * 100,
                      100
                    )
                  : 0;

              const monthLabel =
                new Date(
                  currentYear,
                  index
                ).toLocaleString(
                  "default",
                  {
                    month: "short",
                  }
                );

              return (
                <div
                  className="yearly-row"
                  key={month.month}
                >

                  <div className="yearly-month">
                    {monthLabel}
                  </div>

                  <div className="yearly-bar-container">

                    <div
                      className="yearly-bar"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />

                  </div>

                  <div className="yearly-amount">
                    ₹{amount.toFixed(0)}
                  </div>

                </div>
              );
            }
          )}

        </div>

      </div>

    </div>
  );
}

// IMPORTANT: App.jsx imports this as default
export default ReportPage;