import { useState } from "react";
import API from "../services/api";

function Donors() {

    const [bloodGroup, setBloodGroup] = useState("");
    const [donors, setDonors] = useState([]);

    const searchDonors = async () => {
        try {
            const res = await API.get(`/donors?bloodGroup=${bloodGroup}`);
            setDonors(res.data);
        } catch (error) {
            console.log(error);
            alert("Error fetching donors");
        }
    };

    return (
        <div className="login-box">

            <h2>Find Blood Donors 🩸</h2>

            <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
            >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
            </select>

            <button onClick={searchDonors}>Search</button>

            <div style={{ marginTop: "20px" }}>
                {donors.map((donor, index) => (
                    <div
                        key={index}
                        style={{
                            border: "1px solid #ddd",
                            padding: "10px",
                            marginBottom: "10px",
                            borderRadius: "5px"
                        }}
                    >
                        <h3>{donor.name}</h3>
                        <p>Email: {donor.email}</p>
                        <p>Blood Group: {donor.bloodGroup}</p>
                    </div>
                ))}
            </div>

        </div>
    );
}

export default Donors;