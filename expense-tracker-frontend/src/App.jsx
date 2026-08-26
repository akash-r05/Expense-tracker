import { useEffect, useState } from "react";
import "./App.css";

import {
  getCategories,
  getExpenses,
  getBudgets
} from "./api";

import AuthPage from "./AuthPage";

import ExpensePage from "./ExpensePage";
import BudgetPage from "./BudgetPage";
import CategoryPage from "./CategoryPage";
import ReportPage from "./ReportPage";


function App() {

  // =====================================================
  // AUTHENTICATED USER
  // =====================================================

  const [user, setUser] = useState(() => {

    try {

      const savedUser = localStorage.getItem("user");

      return savedUser
        ? JSON.parse(savedUser)
        : null;

    } catch (error) {

      console.error("Invalid saved user:", error);

      localStorage.removeItem("user");

      return null;
    }

  });


  const userEmail = user?.email || "";


  // =====================================================
  // ACTIVE PAGE
  // =====================================================

  const [activePage, setActivePage] =
    useState("dashboard");


  // =====================================================
  // DASHBOARD DATA
  // =====================================================

  const [expenses, setExpenses] = useState([]);

  const [categories, setCategories] = useState([]);

  const [budgets, setBudgets] = useState([]);

  const [loading, setLoading] = useState(false);

  const [dashboardError, setDashboardError] =
    useState("");


  // =====================================================
  // HELPER FUNCTIONS
  // =====================================================

  /*
   * Backend responses can sometimes be:
   *
   * []
   *
   * OR
   *
   * {
   *   data: []
   * }
   *
   * OR
   *
   * {
   *   content: []
   * }
   *
   * This makes the frontend handle all of them.
   */

  const extractArray = (response) => {

    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.content)) {
      return response.content;
    }

    if (Array.isArray(response?.items)) {
      return response.items;
    }

    return [];
  };


  // =====================================================
  // GET EXPENSE AMOUNT
  // =====================================================

  const getExpenseAmount = (expense) => {

    return Number(
      expense?.amount ??
      expense?.totalAmount ??
      expense?.value ??
      0
    );

  };


  // =====================================================
  // GET BUDGET AMOUNT
  // =====================================================

  const getBudgetAmount = (budget) => {

    return Number(
      budget?.limitAmount ??
      budget?.budgetAmount ??
      budget?.amount ??
      budget?.limit ??
      0
    );

  };


  // =====================================================
  // GET CATEGORY ID
  // =====================================================

  const getCategoryId = (item) => {

    return (
      item?.categoryId ??
      item?.category?.id ??
      item?.category?.categoryId ??
      null
    );

  };


  // =====================================================
  // GET CATEGORY NAME
  // =====================================================

  const getCategoryName = (item) => {

    return (
      item?.categoryName ??
      item?.category?.name ??
      item?.category?.categoryName ??
      item?.category?.category_name ??
      "Unknown"
    );

  };


  // =====================================================
  // GET EXPENSE DATE
  // =====================================================

  const getExpenseDate = (expense) => {

    return (
      expense?.expenseDate ??
      expense?.date ??
      expense?.createdAt ??
      ""
    );

  };


  // =====================================================
  // LOAD DASHBOARD DATA
  // =====================================================

  useEffect(() => {

    if (!userEmail) {
      return;
    }


    const loadDashboardData = async () => {

      setLoading(true);
      setDashboardError("");


      try {

        const [
          categoriesResponse,
          expensesResponse,
          budgetsResponse
        ] = await Promise.all([

          getCategories(userEmail),

          getExpenses(userEmail),

          getBudgets(userEmail)

        ]);


        // -----------------------------------------------
        // NORMALIZE API RESPONSES
        // -----------------------------------------------

        const categoriesData =
          extractArray(categoriesResponse);

        const expensesData =
          extractArray(expensesResponse);

        const budgetsData =
          extractArray(budgetsResponse);


        console.log(
          "Dashboard Categories:",
          categoriesData
        );

        console.log(
          "Dashboard Expenses:",
          expensesData
        );

        console.log(
          "Dashboard Budgets:",
          budgetsData
        );


        // -----------------------------------------------
        // SAVE DATA
        // -----------------------------------------------

        setCategories(categoriesData);

        setExpenses(expensesData);

        setBudgets(budgetsData);


      } catch (error) {

        console.error(
          "Dashboard loading error:",
          error
        );


        setDashboardError(
          error?.message ||
          "Unable to load dashboard data."
        );


        setCategories([]);

        setExpenses([]);

        setBudgets([]);


      } finally {

        setLoading(false);

      }

    };


    loadDashboardData();


  }, [
    activePage,
    userEmail
  ]);


  // =====================================================
  // REFRESH DASHBOARD WHEN WINDOW GETS FOCUS
  // =====================================================

  useEffect(() => {

    if (!userEmail) {
      return;
    }


    const handleFocus = () => {

      if (activePage === "dashboard") {

        /*
         * Changing page to dashboard normally reloads the
         * data. This event also helps when the user returns
         * to the browser after adding/updating data.
         */

        setActivePage((currentPage) =>
          currentPage === "dashboard"
            ? "dashboard"
            : currentPage
        );

      }

    };


    window.addEventListener(
      "focus",
      handleFocus
    );


    return () => {

      window.removeEventListener(
        "focus",
        handleFocus
      );

    };

  }, [
    userEmail,
    activePage
  ]);


  // =====================================================
  // TOTAL SPENT
  // =====================================================

  const totalSpent =
    expenses.reduce(
      (total, expense) => {

        return (
          total +
          getExpenseAmount(expense)
        );

      },
      0
    );


  // =====================================================
  // TOTAL BUDGET
  // =====================================================

  const totalBudget =
    budgets.reduce(
      (total, budget) => {

        return (
          total +
          getBudgetAmount(budget)
        );

      },
      0
    );


  // =====================================================
  // REMAINING BUDGET
  // =====================================================

  const remainingBudget =
    Math.max(
      totalBudget - totalSpent,
      0
    );


  // =====================================================
  // BUDGET USED %
  // =====================================================

  const budgetUsed =
    totalBudget > 0
      ? Math.min(
          (totalSpent / totalBudget) * 100,
          100
        )
      : 0;


  // =====================================================
  // CATEGORY BREAKDOWN
  // =====================================================

  const categoryBreakdown =

    budgets

      .filter(
        (budget) =>
          getBudgetAmount(budget) > 0
      )

      .map((budget) => {

        // -----------------------------------------------
        // CATEGORY INFORMATION
        // -----------------------------------------------

        const categoryName =
          getCategoryName(budget);


        const categoryId =
          getCategoryId(budget);


        // -----------------------------------------------
        // FIND EXPENSES FOR THIS CATEGORY
        // -----------------------------------------------

        const categoryExpenses =
          expenses.filter((expense) => {

            const expenseCategoryId =
              getCategoryId(expense);


            const expenseCategoryName =
              getCategoryName(expense);


            // -------------------------------------------
            // FIRST: CATEGORY ID MATCH
            // -------------------------------------------

            if (
              categoryId !== null &&
              expenseCategoryId !== null
            ) {

              return (
                Number(categoryId) ===
                Number(expenseCategoryId)
              );

            }


            // -------------------------------------------
            // SECOND: CATEGORY NAME MATCH
            // -------------------------------------------

            if (
              categoryName &&
              expenseCategoryName
            ) {

              return (
                categoryName
                  .trim()
                  .toLowerCase() ===
                expenseCategoryName
                  .trim()
                  .toLowerCase()
              );

            }


            return false;

          });


        // -----------------------------------------------
        // TOTAL SPENT FOR CATEGORY
        // -----------------------------------------------

        const spent =
          categoryExpenses.reduce(
            (total, expense) => {

              return (
                total +
                getExpenseAmount(expense)
              );

            },
            0
          );


        // -----------------------------------------------
        // BUDGET LIMIT
        // -----------------------------------------------

        const limit =
          getBudgetAmount(budget);


        // -----------------------------------------------
        // PERCENTAGE
        // -----------------------------------------------

        const percentage =
          limit > 0
            ? Math.min(
                (spent / limit) * 100,
                100
              )
            : 0;


        // -----------------------------------------------
        // ALERT SETTINGS
        // -----------------------------------------------

        const alertThreshold =
          Number(
            budget?.alertThreshold ??
            budget?.alertPercentage ??
            80
          );


        const alertEnabled =
          budget?.alertEnabled !== false;


        return {

          categoryName,

          categoryId,

          spent,

          limit,

          percentage,

          alertThreshold,

          alertEnabled

        };

      });


  // =====================================================
  // BUDGET ALERTS
  // =====================================================

  const alertCategories =
    categoryBreakdown.filter(
      (category) =>

        category.alertEnabled &&

        category.limit > 0 &&

        category.percentage >=
          category.alertThreshold
    );


  // =====================================================
  // CURRENT MONTH
  // =====================================================

  const currentMonth =
    new Date().toLocaleString(
      "en-US",
      {
        month: "long",
        year: "numeric"
      }
    );


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {

    localStorage.removeItem("user");

    setUser(null);

    setActivePage("dashboard");

    setExpenses([]);

    setCategories([]);

    setBudgets([]);

  };


  // =====================================================
  // DASHBOARD
  // =====================================================

  const renderDashboard = () => {

    return (

      <main className="container">

        {/* =================================================
            WELCOME SECTION
        ================================================= */}

        <section className="welcome-section">

          <div>

            <h2>
              Welcome back, {user?.firstName || "User"} 👋
            </h2>

            <p>
              Here's your financial overview for {currentMonth}.
            </p>

          </div>

        </section>


        {/* =================================================
            ERROR
        ================================================= */}

        {dashboardError && (

          <div className="dashboard-error">

            <span>
              ⚠️
            </span>

            <span>
              {dashboardError}
            </span>

          </div>

        )}


        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (

          <div className="dashboard-loading">

            <div className="loading-spinner"></div>

            <span>
              Loading your financial data...
            </span>

          </div>

        )}


        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <section className="summary">


          {/* TOTAL SPENT */}

          <div className="summary-card">

            <div className="summary-icon">
              💸
            </div>

            <div>

              <p>
                Total Spent
              </p>

              <h2>
                ₹{totalSpent.toFixed(2)}
              </h2>

            </div>

          </div>


          {/* TOTAL BUDGET */}

          <div className="summary-card">

            <div className="summary-icon">
              🎯
            </div>

            <div>

              <p>
                Total Budget
              </p>

              <h2>
                ₹{totalBudget.toFixed(2)}
              </h2>

            </div>

          </div>


          {/* REMAINING */}

          <div className="summary-card">

            <div className="summary-icon">
              💰
            </div>

            <div>

              <p>
                Remaining
              </p>

              <h2>
                ₹{remainingBudget.toFixed(2)}
              </h2>

            </div>

          </div>


          {/* TRANSACTIONS */}

          <div className="summary-card">

            <div className="summary-icon">
              🧾
            </div>

            <div>

              <p>
                Transactions
              </p>

              <h2>
                {expenses.length}
              </h2>

            </div>

          </div>

        </section>


        {/* =================================================
            OVERALL BUDGET PROGRESS
        ================================================= */}

        <section className="card budget-overview">

          <div className="section-title-row">

            <div>

              <h2>
                Overall Budget
              </h2>

              <p>
                Your spending progress
              </p>

            </div>


            <strong>
              {budgetUsed.toFixed(1)}%
            </strong>

          </div>


          <div className="overall-progress">

            <div
              className="overall-progress-fill"
              style={{
                width: `${budgetUsed}%`
              }}
            />

          </div>


          <div className="budget-overview-footer">

            <span>
              ₹{totalSpent.toFixed(2)} spent
            </span>

            <span>
              ₹{totalBudget.toFixed(2)} budget
            </span>

          </div>

        </section>


        {/* =================================================
            BUDGET ALERTS
        ================================================= */}

        {alertCategories.length > 0 && (

          <section className="alerts-section">

            {alertCategories.map(
              (category, index) => (

                <div
                  className="alert"
                  key={
                    category.categoryId ??
                    category.categoryName ??
                    index
                  }
                >

                  <span className="alert-icon">
                    ⚠️
                  </span>

                  <div>

                    <strong>
                      Budget Alert — {category.categoryName}
                    </strong>

                    <p>

                      You have used{" "}

                      {Math.round(
                        category.percentage
                      )}%

                      {" "}of your budget.

                      {" "}₹
                      {category.spent.toFixed(2)}

                      {" "}of ₹
                      {category.limit.toFixed(2)}

                    </p>

                  </div>

                </div>

              )
            )}

          </section>

        )}


        {/* =================================================
            TWO COLUMN DASHBOARD
        ================================================= */}

        <div className="dashboard-grid">


          {/* =================================================
              CATEGORY BREAKDOWN
          ================================================= */}

          <section className="card">

            <div className="section-title-row">

              <div>

                <h2>
                  Category Breakdown
                </h2>

                <p>
                  Spending against category budgets
                </p>

              </div>

            </div>


            {categoryBreakdown.length > 0 ? (

              <div className="category-list">

                {categoryBreakdown.map(
                  (category, index) => (

                    <div
                      className="category"
                      key={
                        category.categoryId ??
                        category.categoryName ??
                        index
                      }
                    >

                      <div className="category-header">

                        <span className="category-name">

                          <span className="category-dot"></span>

                          {category.categoryName}

                        </span>


                        <strong>

                          ₹
                          {category.spent.toFixed(2)}

                          <span className="category-limit">

                            {" / "}
                            ₹
                            {category.limit.toFixed(2)}

                          </span>

                        </strong>


                        <span className="category-percentage">

                          {Math.round(
                            category.percentage
                          )}%

                        </span>

                      </div>


                      <div className="progress">

                        <div
                          className="progress-fill"
                          style={{
                            width:
                              `${category.percentage}%`
                          }}
                        />

                      </div>

                    </div>

                  )
                )}

              </div>

            ) : (

              <div className="empty-state">

                <div className="empty-icon">
                  🎯
                </div>

                <h3>
                  No budgets yet
                </h3>

                <p>
                  Create a budget to start tracking your spending.
                </p>

              </div>

            )}

          </section>


          {/* =================================================
              QUICK OVERVIEW
          ================================================= */}

          <section className="card quick-overview">

            <div className="section-title-row">

              <div>

                <h2>
                  Quick Overview
                </h2>

                <p>
                  Your account at a glance
                </p>

              </div>

            </div>


            <div className="overview-item">

              <span>
                Categories
              </span>

              <strong>
                {categories.length}
              </strong>

            </div>


            <div className="overview-item">

              <span>
                Budgets
              </span>

              <strong>
                {budgets.length}
              </strong>

            </div>


            <div className="overview-item">

              <span>
                Expenses
              </span>

              <strong>
                {expenses.length}
              </strong>

            </div>


            <div className="overview-item">

              <span>
                Budget Used
              </span>

              <strong>
                {budgetUsed.toFixed(1)}%
              </strong>

            </div>


            <div className="overview-item">

              <span>
                Available Budget
              </span>

              <strong>
                ₹{remainingBudget.toFixed(2)}
              </strong>

            </div>

          </section>

        </div>


        {/* =================================================
            RECENT TRANSACTIONS
        ================================================= */}

        <section className="card transactions-card">

          <div className="section-title-row">

            <div>

              <h2>
                Recent Transactions
              </h2>

              <p>
                Your latest expenses
              </p>

            </div>


            <span className="transaction-count">

              {expenses.length} total

            </span>

          </div>


          <div className="table">

            {/* TABLE HEADER */}

            <div className="table-row table-header">

              <span>
                Date
              </span>

              <span>
                Description
              </span>

              <span>
                Category
              </span>

              <span>
                Method
              </span>

              <span>
                Amount
              </span>

            </div>


            {/* TRANSACTIONS */}

            {expenses.length > 0 ? (

              [...expenses]

                .sort(
                  (a, b) => {

                    const dateA =
                      new Date(
                        getExpenseDate(a)
                      );

                    const dateB =
                      new Date(
                        getExpenseDate(b)
                      );

                    return dateB - dateA;

                  }
                )

                .slice(0, 8)

                .map(
                  (expense) => (

                    <div
                      className="table-row"
                      key={expense.id}
                    >

                      <span>
                        {getExpenseDate(expense) ||
                          "—"}
                      </span>


                      <span className="transaction-description">

                        {expense.description ||
                          "No description"}

                      </span>


                      <span>

                        <span className="badge groceries">

                          {getCategoryName(expense)}

                        </span>

                      </span>


                      <span>
                        {expense.paymentMethod ||
                          expense.method ||
                          "—"}
                      </span>


                      <strong className="transaction-amount">

                        ₹
                        {getExpenseAmount(
                          expense
                        ).toFixed(2)}

                      </strong>

                    </div>

                  )
                )

            ) : (

              <div className="empty-table">

                <div className="empty-icon">
                  🧾
                </div>

                <h3>
                  No transactions yet
                </h3>

                <p>
                  Your recent expenses will appear here.
                </p>

              </div>

            )}

          </div>

        </section>

      </main>

    );

  };


  // =====================================================
  // PAGE ROUTING
  // =====================================================

  const renderPage = () => {

    switch (activePage) {

      case "expenses":

        return (
          <ExpensePage
            userEmail={userEmail}
          />
        );


      case "budgets":

        return (
          <BudgetPage
            userEmail={userEmail}
          />
        );


      case "categories":

        return (
          <CategoryPage
            userEmail={userEmail}
          />
        );


      case "reports":

        return (
          <ReportPage
            userEmail={userEmail}
          />
        );


      case "dashboard":

      default:

        return renderDashboard();

    }

  };


  // =====================================================
  // LOGIN PAGE
  // =====================================================

  if (!user) {

    return (

      <AuthPage

        onLogin={(loggedInUser) => {

          localStorage.setItem(
            "user",
            JSON.stringify(loggedInUser)
          );

          setUser(loggedInUser);

          setActivePage("dashboard");

        }}

      />

    );

  }


  // =====================================================
  // MAIN APPLICATION
  // =====================================================

  return (

    <div className="app">


      {/* =================================================
          HEADER
      ================================================= */}

      <header className="header">

        <div className="brand">

          <div className="brand-icon">
            💰
          </div>

          <div>

            <h1>
              Expense Tracker
            </h1>

            <p>
              {currentMonth}
            </p>

          </div>

        </div>


        {/* =================================================
            USER
        ================================================= */}

        <div className="user">

          <div className="user-info">

            <strong>

              {user?.firstName || ""}
              {" "}
              {user?.lastName || ""}

            </strong>

            <span>
              {user?.email || ""}
            </span>

          </div>


          {/*
             Header avatar removed intentionally.
             This was causing the standalone "A" shown
             underneath the user information.
          */}


          <button
            className="logout-button"
            onClick={handleLogout}
          >

            Logout

          </button>

        </div>

      </header>


      {/* =================================================
          NAVIGATION
      ================================================= */}

      <nav className="navbar">

        <button
          className={
            activePage === "dashboard"
              ? "nav-button active"
              : "nav-button"
          }
          onClick={() =>
            setActivePage("dashboard")
          }
        >

          <span>
            📊
          </span>

          Dashboard

        </button>


        <button
          className={
            activePage === "expenses"
              ? "nav-button active"
              : "nav-button"
          }
          onClick={() =>
            setActivePage("expenses")
          }
        >

          <span>
            💳
          </span>

          Expenses

        </button>


        <button
          className={
            activePage === "budgets"
              ? "nav-button active"
              : "nav-button"
          }
          onClick={() =>
            setActivePage("budgets")
          }
        >

          <span>
            🎯
          </span>

          Budgets

        </button>


        <button
          className={
            activePage === "categories"
              ? "nav-button active"
              : "nav-button"
          }
          onClick={() =>
            setActivePage("categories")
          }
        >

          <span>
            🏷️
          </span>

          Categories

        </button>


        <button
          className={
            activePage === "reports"
              ? "nav-button active"
              : "nav-button"
          }
          onClick={() =>
            setActivePage("reports")
          }
        >

          <span>
            📈
          </span>

          Reports

        </button>

      </nav>


      {/* =================================================
          CURRENT PAGE
      ================================================= */}

      {renderPage()}

    </div>

  );

}


export default App;