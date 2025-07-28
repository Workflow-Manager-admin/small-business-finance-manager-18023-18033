import React, { useContext, useEffect, useState } from "react";
import api from "../utils/api";
import { AuthContext } from "../contexts/AuthContext";

function Card({ card }) {
  return (
    <div className="dashboard-card" style={card.style || {}}>
      <div className="dashboard-card-icon">{card.icon}</div>
      <div className="dashboard-card-content">
        <div className="dashboard-card-title">{card.title}</div>
        <div className="dashboard-card-value">{card.value}</div>
      </div>
    </div>
  );
}

// Dummy chart
function Chart({ chartData }) {
  if (!chartData) return null;
  // Render basic bar chart using divs
  const keys = Object.keys(chartData || {});
  return (
    <div className="dashboard-chart">
      <h3>Expenses & Income Overview</h3>
      <div className="chart-bar-group">
        {keys.map(k => (
          <div key={k} className="chart-bar-item">
            <label>{k}</label>
            <div className="bar-bg">
              <div
                className="bar-fill"
                style={{
                  width: chartData[k] + "%",
                  background: "#43a047",
                  minWidth: "3px"
                }}
              ></div>
            </div>
            <span className="bar-value">{chartData[k]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function Dashboard() {
  /**
   * Dashboard summary page, shows cards and charts with aggregated stats.
   */
  const { accessToken } = useContext(AuthContext);
  const [widgets, setWidgets] = useState({ cards: [], chart_data: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard/widgets", { token: accessToken })
      .then(data => setWidgets(data || { cards: [], chart_data: {} }))
      .finally(() => setLoading(false));
  }, [accessToken]);

  if (loading) return <div className="app-centered"><div className="loader"/></div>;

  return (
    <div className="dashboard-container">
      <h1 className="title">Dashboard</h1>
      <div className="dashboard-cards">
        {(widgets.cards || []).map((card, idx) => (
          <Card key={idx} card={card} />
        ))}
      </div>
      <Chart chartData={widgets.chart_data} />
    </div>
  );
}
export default Dashboard;
