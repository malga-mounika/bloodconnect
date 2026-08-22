import { useState, useEffect } from "react";
import API from "../services/api";

function StockManagement() {
    const [stock, setStock] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newStock, setNewStock] = useState({ blood_group: "", units: "" });

    const fetchStock = async () => {
        try {
            const res = await API.get("/hospital/stock");
            setStock(res.data.stock);
        } catch (error) {
            console.error("Error fetching stock", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStock();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await API.post("/hospital/stock/update", newStock);
            alert("Stock updated successfully ✅");
            setNewStock({ blood_group: "", units: "" });
            fetchStock();
        } catch (error) {
            alert("Failed to update stock");
        }
    };

    if (loading) return <div className="loading">Loading Stock...</div>;

    return (
        <div className="requests-container">
            <h2>Blood Stock Management 🏥 Inventory</h2>

            <div className="login-box" style={{ maxWidth: "500px", margin: "20px auto" }}>
                <h3>Update Stock</h3>
                <form onSubmit={handleUpdate} style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    <select
                        value={newStock.blood_group}
                        onChange={(e) => setNewStock({ ...newStock, blood_group: e.target.value })}
                        required
                        style={{ flex: 1 }}
                    >
                        <option value="">Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                    </select>
                    <input
                        type="number"
                        placeholder="Units"
                        value={newStock.units}
                        onChange={(e) => setNewStock({ ...newStock, units: e.target.value })}
                        required
                        style={{ flex: 1 }}
                    />
                    <button type="submit" style={{ width: "auto", padding: "10px 20px" }}>Add</button>
                </form>
            </div>

            <div className="requests-grid">
                {stock.length === 0 ? (
                    <p>No stock data available. Add some blood units to begin.</p>
                ) : (
                    stock.map((item) => (
                        <div key={item.id} className="request-card">
                            <div className="blood-badge">{item.blood_group}</div>
                            <div className="request-info">
                                <h3>{item.units} Units Available</h3>
                                <p>Last Updated: {new Date(item.last_updated).toLocaleString()}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default StockManagement;
