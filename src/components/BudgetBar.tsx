import { budgetPercent } from "../utils/budget";

interface BudgetBarProps {
  spent: number;
  budget: number;
}

export default function BudgetBar({ spent, budget }: BudgetBarProps) {
  const percent = budgetPercent(spent, budget);
  const overBy = spent - budget;
  const isOver = overBy > 0;

  return (
    <div className="budget">
      <div
        className={isOver ? "budget-track over" : "budget-track"}
        role="progressbar"
        aria-label="Budget spent"
        aria-valuemin={0}
        aria-valuemax={budget}
        aria-valuenow={Math.min(spent, budget)}
      >
        <div className="budget-fill" style={{ width: `${percent}%` }} />
      </div>

      <p className="budget-text">
        {spent} of {budget} spent
      </p>

      {isOver && <p className="budget-warning">Over budget by {overBy}</p>}
    </div>
  );
}
