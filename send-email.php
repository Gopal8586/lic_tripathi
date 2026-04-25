<?php
/**
 * Professional SMTP Handler — Team Shivam Tripathi
 * Connects directly to Hostinger SMTP via Sockets
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Verify script is even reached
file_put_contents('script_reached.log', "Script reached at: " . date('Y-m-d H:i:s') . "\n", FILE_APPEND);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid data']);
    exit;
}

// AES-256-CBC Decryption Helper
function tst_decrypt($data, $key) {
    list($encrypted_data, $iv) = explode('::', base64_decode($data), 2);
    return openssl_decrypt($encrypted_data, 'aes-256-cbc', $key, 0, $iv);
}

$secret_key = 'tst_secure_lic_key_2024';
$c_user = 'Vkh0MTRnOGpDdk9nS1V0L3Nia1ZpM1dndDRmK3g5Tk80cUpWOTI1ZmluVzN1S29Wd2F2RWxMVEZrbzBrRjRndS84ODFqdnBvL204M1hDRW1PQUJjNUE9PTo6XisWfV0rQJ9hS7f7N7Dq6Q==';
$c_pass = 'dkdZNDNGRERoekU3L2E4R2YyZkpBdz09Ojq2+g2mPscY34L4L9l0mY+B';

$smtp_user = tst_decrypt($c_user, $secret_key);
$smtp_pass = tst_decrypt($c_pass, $secret_key);
$smtp_host = 'ssl://smtp.hostinger.com';
$smtp_port = 465;

// Data Extraction
$name    = $input['name'] ?? 'Applicant';
$email   = $input['email'] ?? '';
$mobile  = $input['mobile'] ?? 'Not provided';
$dob     = $input['dob'] ?? 'Not provided';
$qual    = $input['qualification'] ?? 'Not provided';
$city    = $input['city'] ?? 'Not provided';
$occ     = $input['occupation'] ?? 'Not provided';

// 1. ADMIN NOTIFICATION BODY
$admin_subject = "New LIC Agent Application: $name";
$admin_body = "
<html>
<body style='font-family: Arial, sans-serif; color: #333;'>
    <div style='max-width: 600px; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>
        <h2 style='color: #1d4e9e;'>New Application Received</h2>
        <p><strong>Name:</strong> $name</p>
        <p><strong>Mobile:</strong> $mobile</p>
        <p><strong>Email:</strong> $email</p>
        <p><strong>DOB:</strong> $dob</p>
        <p><strong>Qualification:</strong> $qual</p>
        <p><strong>City:</strong> $city</p>
        <p><strong>Occupation:</strong> $occ</p>
    </div>
</body>
</html>";

// 2. USER AUTO-REPLY BODY
$user_subject = "Application Received - Team Shivam Tripathi";
$user_body = "
<html>
<body style='font-family: Arial, sans-serif; background: #f4f7fa; padding: 20px;'>
    <div style='max-width: 600px; margin: 0 auto; background: #fff; border-radius: 15px; overflow: hidden;'>
        <div style='background: #1d4e9e; color: #fff; padding: 30px; text-align: center;'>
            <h1 style='margin: 0;'>Thank You, $name!</h1>
        </div>
        <div style='padding: 30px;'>
            <p>We have received your application to join <strong>Team Shivam Tripathi</strong>. Our team will contact you shortly.</p>
            <div style='background: #f8fafc; border-left: 4px solid #fbc707; padding: 15px;'>
                <p style='margin: 0;'><strong>Location:</strong> $city</p>
                <p style='margin: 5px 0 0;'><strong>Qualification:</strong> $qual</p>
            </div>
            <p>Best Regards,<br><strong>Team Shivam Tripathi</strong></p>
        </div>
    </div>
</body>
</html>";

/**
 * Robust PHP SMTP Client
 */
function send_smtp($to, $subject, $message, $user, $pass, $host, $port) {
    $log = "--- SMTP SESSION STARTED: " . date('Y-m-d H:i:s') . " ---\n";
    $log .= "To: $to | Subject: $subject\n";

    $smtp = fsockopen($host, $port, $errno, $errstr, 30);
    if (!$smtp) {
        file_put_contents('smtp_debug.log', "CONN ERROR: $errstr ($errno)\n", FILE_APPEND);
        return false;
    }

    function get_res($s, &$l) {
        $r = "";
        while ($line = fgets($s, 512)) {
            $r .= $line;
            if (substr($line, 3, 1) == " ") break;
        }
        $l .= "S: " . $r;
        return $r;
    }

    $header = "To: $to\r\n";
    $header .= "From: Team Shivam Tripathi <$user>\r\n";
    $header .= "Subject: $subject\r\n";
    $header .= "MIME-Version: 1.0\r\n";
    $header .= "Content-Type: text/html; charset=UTF-8\r\n";
    $header .= "Content-Transfer-Encoding: 7bit\r\n\r\n";

    get_res($smtp, $log); // Welcome message

    $cmds = [
        "EHLO " . ($_SERVER['HTTP_HOST'] ?? 'localhost') . "\r\n" => 250,
        "AUTH LOGIN\r\n" => 334,
        base64_encode($user) . "\r\n" => 334,
        base64_encode($pass) . "\r\n" => 235,
        "MAIL FROM: <$user>\r\n" => 250,
        "RCPT TO: <$to>\r\n" => 250,
        "DATA\r\n" => 354,
        $header . $message . "\r\n.\r\n" => 250,
        "QUIT\r\n" => 221
    ];

    $success = true;
    foreach ($cmds as $cmd => $code) {
        fwrite($smtp, $cmd);
        $log .= "C: " . (strpos($cmd, 'AUTH') === false && strlen($cmd) < 100 ? $cmd : "[HIDDEN/LONG]\n");
        $res = get_res($smtp, $log);
        if (intval(substr($res, 0, 3)) !== $code) {
            $success = false;
            break;
        }
    }

    fclose($smtp);
    $log .= "--- SESSION ENDED (Success: " . ($success ? 'YES' : 'NO') . ") ---\n\n";
    file_put_contents('smtp_debug.log', $log, FILE_APPEND);
    return $success;
}

// Execute Sending
$admin_sent = send_smtp($smtp_user, $admin_subject, $admin_body, $smtp_user, $smtp_pass, $smtp_host, $smtp_port);

if ($admin_sent) {
    if (!empty($email)) {
        send_smtp($email, $user_subject, $user_body, $smtp_user, $smtp_pass, $smtp_host, $smtp_port);
    }
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'SMTP Connection Failed']);
}
?>