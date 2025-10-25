import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import './PersonalFinancePage.css';

interface FinancialTool {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'calculator' | 'planner' | 'tracker' | 'education';
}

interface CalculatorResult {
  monthlyPayment: number;
  totalInterest: number;
  totalAmount: number;
}

const PersonalFinancePage: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [calculatorResult, setCalculatorResult] = useState<CalculatorResult | null>(null);
  const [formData, setFormData] = useState({
    loanAmount: '',
    interestRate: '',
    loanTerm: '',
    monthlyIncome: '',
    monthlyExpenses: '',
    savingsGoal: '',
    timeFrame: ''
  });

  const financialTools: FinancialTool[] = [
    {
      id: 'loan-calculator',
      title: 'Loan Calculator',
      description: 'Calculate monthly payments and total interest for loans',
      icon: '💰',
      category: 'calculator'
    },
    {
      id: 'budget-planner',
      title: 'Budget Planner',
      description: 'Plan and track your monthly budget',
      icon: '📊',
      category: 'planner'
    },
    {
      id: 'savings-calculator',
      title: 'Savings Calculator',
      description: 'Calculate how much you need to save for your goals',
      icon: '🎯',
      category: 'calculator'
    },
    {
      id: 'investment-tracker',
      title: 'Investment Tracker',
      description: 'Track your investment portfolio performance',
      icon: '📈',
      category: 'tracker'
    },
    {
      id: 'retirement-planner',
      title: 'Retirement Planner',
      description: 'Plan for your retirement savings',
      icon: '🏖️',
      category: 'planner'
    },
    {
      id: 'debt-payoff',
      title: 'Debt Payoff Calculator',
      description: 'Create a strategy to pay off your debts',
      icon: '💳',
      category: 'calculator'
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateLoan = () => {
    const principal = parseFloat(formData.loanAmount);
    const rate = parseFloat(formData.interestRate) / 100 / 12;
    const months = parseFloat(formData.loanTerm) * 12;

    if (principal && rate && months) {
      const monthlyPayment = (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
      const totalAmount = monthlyPayment * months;
      const totalInterest = totalAmount - principal;

      setCalculatorResult({
        monthlyPayment,
        totalInterest,
        totalAmount
      });
    }
  };

  const calculateSavings = () => {
    const goal = parseFloat(formData.savingsGoal);
    const time = parseFloat(formData.timeFrame);

    if (goal && time) {
      const monthlySavings = goal / (time * 12);
      setCalculatorResult({
        monthlyPayment: monthlySavings,
        totalInterest: 0,
        totalAmount: goal
      });
    }
  };

  const renderCalculator = () => {
    switch (selectedTool) {
      case 'loan-calculator':
        return (
          <div className="calculator-form">
            <h3>Loan Calculator</h3>
            <div className="form-group">
              <label>Loan Amount ($)</label>
              <input
                type="number"
                value={formData.loanAmount}
                onChange={(e) => handleInputChange('loanAmount', e.target.value)}
                placeholder="Enter loan amount"
              />
            </div>
            <div className="form-group">
              <label>Annual Interest Rate (%)</label>
              <input
                type="number"
                value={formData.interestRate}
                onChange={(e) => handleInputChange('interestRate', e.target.value)}
                placeholder="Enter interest rate"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label>Loan Term (Years)</label>
              <input
                type="number"
                value={formData.loanTerm}
                onChange={(e) => handleInputChange('loanTerm', e.target.value)}
                placeholder="Enter loan term"
              />
            </div>
            <Button onClick={calculateLoan} className="calculate-btn">
              Calculate
            </Button>
          </div>
        );

      case 'savings-calculator':
        return (
          <div className="calculator-form">
            <h3>Savings Calculator</h3>
            <div className="form-group">
              <label>Savings Goal ($)</label>
              <input
                type="number"
                value={formData.savingsGoal}
                onChange={(e) => handleInputChange('savingsGoal', e.target.value)}
                placeholder="Enter savings goal"
              />
            </div>
            <div className="form-group">
              <label>Time Frame (Years)</label>
              <input
                type="number"
                value={formData.timeFrame}
                onChange={(e) => handleInputChange('timeFrame', e.target.value)}
                placeholder="Enter time frame"
              />
            </div>
            <Button onClick={calculateSavings} className="calculate-btn">
              Calculate
            </Button>
          </div>
        );

      case 'budget-planner':
        return (
          <div className="calculator-form">
            <h3>Budget Planner</h3>
            <div className="form-group">
              <label>Monthly Income ($)</label>
              <input
                type="number"
                value={formData.monthlyIncome}
                onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                placeholder="Enter monthly income"
              />
            </div>
            <div className="form-group">
              <label>Monthly Expenses ($)</label>
              <input
                type="number"
                value={formData.monthlyExpenses}
                onChange={(e) => handleInputChange('monthlyExpenses', e.target.value)}
                placeholder="Enter monthly expenses"
              />
            </div>
            <div className="budget-summary">
              <div className="budget-item">
                <span>Income:</span>
                <span>${formData.monthlyIncome || '0'}</span>
              </div>
              <div className="budget-item">
                <span>Expenses:</span>
                <span>${formData.monthlyExpenses || '0'}</span>
              </div>
              <div className="budget-item total">
                <span>Remaining:</span>
                <span className={parseFloat(formData.monthlyIncome || '0') - parseFloat(formData.monthlyExpenses || '0') >= 0 ? 'positive' : 'negative'}>
                  ${(parseFloat(formData.monthlyIncome || '0') - parseFloat(formData.monthlyExpenses || '0')).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="tool-placeholder">
            <h3>Coming Soon</h3>
            <p>This tool is under development. Check back soon!</p>
          </div>
        );
    }
  };

  return (
    <div className="personal-finance-page">
      <div className="finance-header">
        <h1 className="finance-title">Personal Finance</h1>
        <p className="finance-subtitle">Tools and calculators to manage your finances</p>
      </div>

      <div className="finance-content">
        <div className="tools-grid">
          {financialTools.map((tool) => (
            <div
              key={tool.id}
              className={`tool-card ${selectedTool === tool.id ? 'selected' : ''}`}
              onClick={() => setSelectedTool(tool.id)}
            >
              <div className="tool-icon">{tool.icon}</div>
              <h3 className="tool-title">{tool.title}</h3>
              <p className="tool-description">{tool.description}</p>
            </div>
          ))}
        </div>

        {selectedTool && (
          <div className="tool-workspace">
            <div className="workspace-header">
              <h2>{financialTools.find(t => t.id === selectedTool)?.title}</h2>
              <Button
                variant="outline"
                size="small"
                onClick={() => setSelectedTool(null)}
              >
                Close
              </Button>
            </div>
            <div className="workspace-content">
              {renderCalculator()}
              {calculatorResult && (
                <div className="calculator-results">
                  <h4>Results</h4>
                  <div className="result-item">
                    <span>Monthly Payment:</span>
                    <span>${calculatorResult.monthlyPayment.toFixed(2)}</span>
                  </div>
                  {calculatorResult.totalInterest > 0 && (
                    <div className="result-item">
                      <span>Total Interest:</span>
                      <span>${calculatorResult.totalInterest.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="result-item">
                    <span>Total Amount:</span>
                    <span>${calculatorResult.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalFinancePage;
