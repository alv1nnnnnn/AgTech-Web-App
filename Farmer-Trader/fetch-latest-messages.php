<?php
session_start();
require_once '../Connection/connection.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$user_id = $_SESSION['user_id'];

// Get latest messages from conversations where the user is either sender or receiver
$sql = "
    SELECT 
        c.product_id, 
        IF(c.receiver_id = ?, c.receiver_id, c.sender_id) AS participant_id,
        c.message, 
        c.sent_at,
        c.sender_id,
        c.message_type
    FROM chat c
    WHERE c.sent_at = (
        SELECT MAX(sent_at)
        FROM chat
        WHERE ((sender_id = ? AND receiver_id = c.receiver_id)
            OR (receiver_id = ? AND sender_id = c.sender_id))
          AND product_id = c.product_id
    )
    AND (c.sender_id = ? OR c.receiver_id = ?)
    ORDER BY c.sent_at DESC
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("iiiii", $user_id, $user_id, $user_id, $user_id, $user_id);
$stmt->execute();
$result = $stmt->get_result();

$messages = [];

while ($row = $result->fetch_assoc()) {
    $preview = $row['message_type'] === 'image' ? 'Sent a photo.' : $row['message'];
    $messages[] = [
        'participant_id' => $row['participant_id'],
        'product_id' => $row['product_id'],
        'message' => $preview,
        'time' => date('h:i A', strtotime($row['sent_at'])),
        'sender_id' => $row['sender_id']
    ];
}

echo json_encode(['messages' => $messages]);