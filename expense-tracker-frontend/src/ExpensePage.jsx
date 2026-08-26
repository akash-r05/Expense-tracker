import { useEffect, useState } from "react";
import {
  getExpenses,
  getCategories,
  addExpense,
  updateExpense,
  deleteExpense,
} from "./api";

function ExpensePage({ userEmail }) {

  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    categoryId: "",
    description: "",
    amount: "",
    expenseDate: "",
    paymentMethod: "UPI",
    notes: "",
    recurring: false,
  });

  // ===============================
  // LOAD DATA
  // ===============================

  const loadData = async () => {
    try {
      const expenseData = await getExpenses(userEmail);
      const categoryData = await getCategories(userEmail);

      setExpenses(expenseData || []);
      setCategories(categoryData || []);
    } catch (error) {
      console.error("Error loading expenses:", error);
      alert("Failed to load expenses. Please try again.");
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

    setForm((previousForm) => ({
      ...previousForm,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ===============================
  // VALIDATION
  // ===============================

  const validateForm = () => {
    // Category validation
    if (!form.categoryId) {
      alert("Please select a category.");
      return false;
    }

    // Description validation
    const description = form.description.trim();

    if (!description) {
      alert("Please enter a description.");
      return false;
    }

    if (description.length > 100) {
      alert("Description cannot exceed 100 characters.");
      return false;
    }

    // Amount validation
    const amount = Number(form.amount);

    if (form.amount === "") {
      alert("Please enter an amount.");
      return false;
    }

    if (!Number.isFinite(amount)) {
      alert("Please enter a valid amount.");
      return false;
    }

    if (amount <= 0) {
      alert("Amount must be greater than 0.");
      return false;
    }

    // Date validation
    if (!form.expenseDate) {
      alert("Please select an expense date.");
      return false;
    }

    // Notes validation
    if (form.notes.trim().length > 250) {
      alert("Notes cannot exceed 250 characters.");
      return false;
    }

    return true;
  };

  // ===============================
  // ADD / UPDATE EXPENSE
  // ===============================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const expenseData = {
      categoryId: Number(form.categoryId),
      description: form.description.trim(),
      amount: Number(form.amount),
      expenseDate: form.expenseDate,
      paymentMethod: form.paymentMethod,
      notes: form.notes.trim(),
      recurring: form.recurring,
    };

    try {
      if (editingId !== null) {
        await updateExpense(
          editingId,
          expenseData,
          userEmail
        );

        alert("Expense updated successfully.");
      } else {
        await addExpense(
          expenseData,
          userEmail
        );

        alert("Expense added successfully.");
      }

      resetForm();
      await loadData();

    } catch (error) {
      console.error("Error saving expense:", error);

      alert(
        error?.message ||
        "Something went wrong while saving the expense."
      );
    }
  };

  // ===============================
  // EDIT
  // ===============================

  const handleEdit = (expense) => {
    setEditingId(expense.id);

    setForm({
      categoryId:
        expense.categoryId ||
        expense.category?.id ||
        "",

      description:
        expense.description || "",

      amount:
        expense.amount || "",

      expenseDate:
        expense.expenseDate || "",

      paymentMethod:
        expense.paymentMethod || "UPI",

      notes:
        expense.notes || "",

      recurring:
        expense.recurring || false,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ===============================
  // DELETE
  // ===============================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this expense?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteExpense(id, userEmail);

      alert("Expense deleted successfully.");

      await loadData();

    } catch (error) {
      console.error("Error deleting expense:", error);

      alert(
        error?.message ||
        "Something went wrong while deleting the expense."
      );
    }
  };

  // ===============================
  // RESET FORM
  // ===============================

  const resetForm = () => {
    setEditingId(null);

    setForm({
      categoryId: "",
      description: "",
      amount: "",
      expenseDate: "",
      paymentMethod: "UPI",
      notes: "",
      recurring: false,
    });
  };

  // ===============================
  // RENDER
  // ===============================

  return (
    <div className="expense-page">

      {/* ===========================
          ADD / EDIT EXPENSE
      =========================== */}

      <h1>
        {editingId !== null
          ? "Edit Expense"
          : "Add Expense"}
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


        {/* DESCRIPTION */}

        <div>
          <label>Description *</label>

          <input
            type="text"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Example: Lunch"
            maxLength="100"
          />
        </div>


        {/* AMOUNT */}

        <div>
          <label>Amount *</label>

          <input
            type="number"
            step="0.01"
            min="0.01"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="Example: 150"
          />
        </div>


        {/* DATE */}

        <div>
          <label>Date *</label>

          <input
            type="date"
            name="expenseDate"
            value={form.expenseDate}
            onChange={handleChange}
          />
        </div>


        {/* PAYMENT METHOD */}

        <div>
          <label>Payment Method</label>

          <select
            name="paymentMethod"
            value={form.paymentMethod}
            onChange={handleChange}
          >
            <option value="UPI">
              UPI
            </option>

            <option value="CASH">
              Cash
            </option>

            <option value="CARD">
              Card
            </option>

            <option value="NET_BANKING">
              Net Banking
            </option>
          </select>
        </div>


        {/* NOTES */}

        <div>
          <label>Notes</label>

          <input
            type="text"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Optional"
            maxLength="250"
          />
        </div>


        {/* RECURRING */}

        <div>
          <label>
            <input
              type="checkbox"
              name="recurring"
              checked={form.recurring}
              onChange={handleChange}
            />

            Recurring Expense
          </label>
        </div>


        {/* SUBMIT */}

        <button type="submit">
          {editingId !== null
            ? "Update Expense"
            : "Add Expense"}
        </button>


        {/* CANCEL */}

        {editingId !== null && (
          <button
            type="button"
            onClick={resetForm}
          >
            Cancel
          </button>
        )}

      </form>


      {/* ===========================
          ALL EXPENSES
      =========================== */}

      <h2>
        All Expenses
      </h2>

      <div className="expense-table expense-list-table">

        {/* TABLE HEADER */}

        <div className="expense-row expense-header">

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

          <span>
            Action
          </span>

        </div>


        {/* NO DATA */}

        {expenses.length === 0 ? (

          <div className="expense-row">

            <span>
              No expenses found
            </span>

          </div>

        ) : (

          /* EXPENSE ROWS */

          expenses.map((expense) => (

            <div
              className="expense-row"
              key={expense.id}
            >

              {/* DATE */}

              <span>
                {expense.expenseDate}
              </span>


              {/* DESCRIPTION */}

              <span>
                {expense.description}
              </span>


              {/* CATEGORY */}

              <span>
                {expense.categoryName ||
                  expense.category?.name ||
                  "Unknown"}
              </span>


              {/* PAYMENT METHOD */}

              <span>
                {expense.paymentMethod}
              </span>


              {/* AMOUNT */}

              <span>
                ₹
                {Number(
                  expense.amount || 0
                ).toFixed(2)}
              </span>


              {/* ACTIONS */}

              <span className="expense-actions">

                <button
                  type="button"
                  className="edit-btn"
                  onClick={() =>
                    handleEdit(expense)
                  }
                >
                  Edit
                </button>

                <button
                  type="button"
                  className="delete-btn"
                  onClick={() =>
                    handleDelete(expense.id)
                  }
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

export default ExpensePage;