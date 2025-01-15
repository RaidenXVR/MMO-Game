import React, { useState } from "react";
import Scene from "./Scene";
import App from "./App";

const Game = () => {
    const [username, setUsername] = useState<string>("");
    const [color, setColor] = useState<string>("")
    const [submitted, setSubmitted] = useState<boolean>(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim()) {
            setSubmitted(true); // Proceed to render the Scene component
        }
    };

    return (
        <>
            {!submitted ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "20vh" }}>
                    <h1>Enter Your Username</h1>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            style={{
                                padding: "10px",
                                fontSize: "16px",
                                marginBottom: "10px",
                                border: "1px solid #ccc",
                                borderRadius: "5px",
                            }}
                        />
                        <input
                            type="text"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            placeholder="Enter Color"
                            style={{
                                padding: "10px",
                                fontSize: "16px",
                                marginBottom: "10px",
                                border: "1px solid #ccc",
                                borderRadius: "5px",
                            }}
                        />
                        <button
                            type="submit"
                            style={{
                                padding: "10px 20px",
                                fontSize: "16px",
                                backgroundColor: "#007BFF",
                                color: "#fff",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                            }}
                        >
                            Start Game
                        </button>
                    </form>
                </div>
            ) : (
                <App username={username} color={color} /> // Pass the username to Scene component
            )}
        </>
    );
};

export default Game;
