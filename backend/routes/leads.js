router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      lead_category,
      name,
      phone_no,
      address,
      assigned_to,
      admin_id,
      campaign_id,
      notes,
    } = req.body;

    // Validate required fields
    if (!title || !status || !name || !phone_no || !admin_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        data: "Title, status, name, phone number, and admin ID are required"
      });
    }

    const [result] = await pool.query(
      `INSERT INTO Leads 
      (title, description, status, lead_category, name, phone_no, address, assigned_to, admin_id, campaign_id, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description || null,
        status,
        lead_category || null,
        name,
        phone_no,
        address || null,
        assigned_to || null,
        admin_id,
        campaign_id || null,
        notes || null
      ]
    );

    res.json({
      success: true,
      message: "Lead created successfully",
      data: { id: result.insertId },
    });
  } catch (error) {
    console.error("Insert lead error:", error);
    res.status(500).json({
      success: false,
      message: "Database error",
      data: error.message
    });
  }
}); 