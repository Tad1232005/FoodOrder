const Maintenance = () => {
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            background: "#fff8f5",
            gap: "16px",
            fontFamily: "Poppins, sans-serif"
        }}>
            <div style={{ fontSize: "64px" }}>🛠️</div>
            <h1 style={{ color: "#ff6347", margin: 0, fontSize: "2rem" }}>
                Under Maintenance
            </h1>
            <p style={{ color: "#888", textAlign: "center", lineHeight: 1.6 }}>
                We're currently performing scheduled maintenance.<br />
                Please check back in a few minutes.
            </p>
        </div>
    );
};

export default Maintenance;