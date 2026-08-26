import { useEffect, useState } from "react";
import {
  getBudgets,
  getCategories,
  addBudget,
  updateBudget,
  deleteBudget,
} from "./api";

function BudgetPage({ userEmail }) {

  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);

  // Track whether we are adding or editing
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    categoryId: "",
    limitAmount: "",
    alertThreshold: 80,
    alertEnabled: true,
  });

  // ===============================
  // LOAD DATA
  // ===============================
  const loadData = async () => {
    try {
      const budgetData = await getBudgets(userEmail);
      const categoryData = await getCategories(userEmail);

      setBudgets(budgetData || []);
      setCategories(categoryData || []);
    } catch (error) {
      console.error("Error loading budgets:", error);
      alert("Failed to load budgets");
    }
  };

useEffect(() => {
  if (userEmail) {
    loadData();
  }
}, [userEmail]);

  // ===============================
  // FORM CHANGE
  // ===============================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // ===============================
  // ADD / UPDATE BUDGET
  // ===============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.limitAmount) {
      alert("Please enter budget amount");
      return;
    }

    const budgetData = {
      limitAmount: Number(form.limitAmount),
      alertThreshold: Number(form.alertThreshold),
      alertEnabled: form.alertEnabled,
    };

    try {

      // ===============================
      // UPDATE
      // ===============================
      if (editingId !== null) {

        await updateBudget(
          editingId,
          budgetData,
          userEmail
        );

        alert("Budget updated successfully");

        setEditingId(null);

      }

      // ===============================
      // ADD
      // ===============================
      else {

        if (!form.categoryId) {
          alert("Please select category");
          return;
        }

        await addBudget(
          budgetData,
          userEmail,
          form.categoryId
        );

        alert("Budget added successfully");
      }

      // Reset form
      setForm({
        categoryId: "",
        limitAmount: "",
        alertThreshold: 80,
        alertEnabled: true,
      });

      loadData();

    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  // ===============================
  // START EDIT
  // ===============================
  const handleEdit = (budget) => {

    setEditingId(budget.id);

    setForm({
      categoryId:
        budget.category?.id ||
        budget.categoryId ||
        "",
      limitAmount: budget.limitAmount || "",
      alertThreshold:
        budget.alertThreshold || 80,
      alertEnabled:
        budget.alertEnabled !== false,
    });

    // Scroll to form
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ===============================
  // CANCEL EDIT
  // ===============================
  const handleCancelEdit = () => {

    setEditingId(null);

    setForm({
      categoryId: "",
      limitAmount: "",
      alertThreshold: 80,
      alertEnabled: true,
    });
  };

  // ===============================
  // DELETE BUDGET
  // ===============================
  const handleDelete = async (id) => {

    const confirmed = window.confirm(
      "Are you sure you want to delete this budget?"
    );

    if (!confirmed) {
      return;
    }

    try {

      await deleteBudget(id, userEmail);

      alert("Budget deleted successfully");

      loadData();

    } catch (error) {

      console.error(error);
      alert(error.message);

    }
  };

  return (
    <div className="expense-page">

      {/* ===============================
          ADD / EDIT BUDGET
      =============================== */}

      <h1>
        {editingId !== null
          ? "Edit Budget"
          : "Add Budget"}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="expense-form"
      >

        {/* CATEGORY */}

        <div>
          <label>Category *</label>

          <select
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            disabled={editingId !== null}
          >

            <option value="">
              Select Category
            </option>

            {categories.map((category) => (

              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>

            ))}

          </select>
        </div>


        {/* LIMIT */}

        <div>
          <label>Budget Amount *</label>

          <input
            type="number"
            step="0.01"
            min="0"
            name="limitAmount"
            value={form.limitAmount}
            onChange={handleChange}
            placeholder="Example: 300"
          />
        </div>


        {/* ALERT THRESHOLD */}

        <div>
          <label>
            Alert Threshold (%)
          </label>

          <input
            type="number"
            min="1"
            max="100"
            name="alertThreshold"
            value={form.alertThreshold}
            onChange={handleChange}
          />
        </div>


        {/* ALERT ENABLE */}

        <div>
          <label>

            <input
              type="checkbox"
              name="alertEnabled"
              checked={form.alertEnabled}
              onChange={handleChange}
            />

            Enable Budget Alert

          </label>
        </div>


        {/* BUTTONS */}

        <button type="submit">

          {editingId !== null
            ? "Update Budget"
            : "Add Budget"}

        </button>


        {editingId !== null && (

          <button
            type="button"
            onClick={handleCancelEdit}
          >
            Cancel
          </button>

        )}

      </form>


      {/* ===============================
          ALL BUDGETS
      =============================== */}

      <h2>All Budgets</h2>

      <div className="expense-table budget-table">

        <div className="expense-row expense-header">

          <span>Category</span>
          <span>Budget</span>
          <span>Alert</span>
          <span>Status</span>
          <span>Action</span>

        </div>


        {budgets.length === 0 ? (

          <div className="expense-row">

            <span>
              No budgets found
            </span>

          </div>

        ) : (

          budgets.map((budget) => (

            <div
              className="expense-row"
              key={budget.id}
            >

              <span>
                {budget.category?.name ||
                  budget.categoryName ||
                  "Unknown"}
              </span>

              <span>
                ₹
                {Number(
                  budget.limitAmount || 0
                ).toFixed(2)}
              </span>

              <span>
                {budget.alertThreshold || 80}%
              </span>

              <span>
                {budget.alertEnabled !== false
                  ? "Enabled"
                  : "Disabled"}
              </span>

              <span className="budget-actions">

                <button
                  type="button"
                  className="edit-btn"
                  onClick={() => handleEdit(budget)}
                >
                  Edit
                </button>

                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => handleDelete(budget.id)}
                >
                  Delete
                </button>

              </span>

            </div>

          ))

        )}

      </div>

    </div>
  );
}

export default BudgetPage;