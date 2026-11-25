<?php
// Database connection parameters
require_once __DIR__.'/../Connection/connection.php';

// Start session
session_start();

function modernLoginUrl(): ?string
{
    if (($_POST['agtech_modern_login'] ?? null) !== '1') {
        return null;
    }

    $base = rtrim(getenv('AGTECH_MODERN_APP_URL') ?: 'http://localhost:8000', '/');
    $parts = parse_url($base);
    if (!isset($parts['scheme'], $parts['host']) || !in_array($parts['scheme'], ['http', 'https'], true)) {
        http_response_code(403);
        exit;
    }

    $origin = $parts['scheme'].'://'.$parts['host'].(isset($parts['port']) ? ':'.$parts['port'] : '');
    if (($_SERVER['HTTP_ORIGIN'] ?? '') !== $origin) {
        http_response_code(403);
        exit;
    }

    return $base.'/login';
}

function loginFailure(?string $modernLoginUrl, string $status, string $message): void
{
    if ($modernLoginUrl !== null) {
        header('Location: '.$modernLoginUrl.'?status='.$status, true, 303);
    } else {
        $_SESSION['error'] = $message;
        header('Location: Login.php', true, 303);
    }
    exit;
}

function getUserData($conn, string $emailOrPhone): ?array
{
    $statement = $conn->prepare('SELECT user_id, password, user_type FROM user WHERE email = ? OR phone_number = ? LIMIT 2');
    $statement->bind_param('ss', $emailOrPhone, $emailOrPhone);
    $statement->execute();
    $result = $statement->get_result();
    $user = $result->num_rows === 1 ? $result->fetch_assoc() : null;
    $statement->close();

    return $user;
}

function handleLoginAttempt($conn, $user_id) {
    $sql = "SELECT login_attempts, is_locked, lock_time FROM userverification WHERE user_id='$user_id'";
    $result = $conn->query($sql);

    if ($result->num_rows == 1) {
        $row = $result->fetch_assoc();
        $login_attempts = $row['login_attempts'] + 1;
        $is_locked = $login_attempts >= 5 ? 1 : 0;
        $lock_time = $is_locked ? date('Y-m-d H:i:s') : NULL;

        $update_sql = "UPDATE userverification SET login_attempts='$login_attempts', is_locked='$is_locked', lock_time='$lock_time' WHERE user_id='$user_id'";
        $conn->query($update_sql);
    } else {
        $insert_sql = "INSERT INTO userverification (user_id, login_attempts, is_locked, lock_time) VALUES ('$user_id', 1, 0, NULL)";
        $conn->query($insert_sql);
    }
}

function logAdminActivity($conn, $admin_id, $activity) {
    $sql = "INSERT INTO activity_log (admin_id, activity) VALUES ('$admin_id', '$activity')";
    $conn->query($sql);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $modernLoginUrl = modernLoginUrl();
    $identifier = is_string($_POST['email_or_phone'] ?? null) ? trim($_POST['email_or_phone']) : '';
    $password = is_string($_POST['password'] ?? null) ? $_POST['password'] : '';
    $invalidMessage = 'Email or Phone and Password is invalid.';
    $_SESSION['email_or_phone'] = $identifier;

    $user = $identifier !== '' && $password !== '' ? getUserData($conn, $identifier) : null;
    if ($user === null) {
        loginFailure($modernLoginUrl, 'invalid', $invalidMessage);
    }

    $userId = (int) $user['user_id'];
    $verification = $conn->query("SELECT is_locked, lock_time FROM userverification WHERE user_id=$userId")->fetch_assoc();

    if (!empty($verification['is_locked'])) {
        $lockTime = isset($verification['lock_time']) ? strtotime($verification['lock_time']) : 0;
        $remainingTime = 15 - (time() - $lockTime);

        if ($remainingTime > 0) {
            if ($modernLoginUrl === null) {
                $_SESSION['remaining_time'] = $remainingTime;
            }

            loginFailure($modernLoginUrl, 'locked', "Account is locked. Please wait {$remainingTime} seconds.");
        }

        $conn->query("UPDATE userverification SET login_attempts=0, is_locked=0, lock_time=NULL WHERE user_id=$userId");
        unset($_SESSION['remaining_time']);
    }

    if (!password_verify($password, $user['password'])) {
        handleLoginAttempt($conn, $userId);
        loginFailure($modernLoginUrl, 'invalid', $invalidMessage);
    }

    $destination = match ($user['user_type']) {
        'Farmer-Trader' => '../Farmer-Trader/Market.php',
        'Admin' => '../Admin/Dashboard.php',
        default => null,
    };

    if ($destination === null) {
        loginFailure($modernLoginUrl, 'invalid', $invalidMessage);
    }

    $conn->query("UPDATE userverification SET login_attempts=0 WHERE user_id=$userId");
    if ($user['user_type'] === 'Admin') {
        logAdminActivity($conn, $userId, 'Admin logged in');
    }

    session_regenerate_id(true);
    $_SESSION['user_id'] = $userId;
    unset($_SESSION['error'], $_SESSION['remaining_time']);
    header('Location: '.$destination, true, 303);
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AgTech - Login</title>
    <link rel="stylesheet" href="../css/login_register.css?<?php echo time(); ?>">
    <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.bundle.min.js"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <script src="https://unpkg.com/sweetalert/dist/sweetalert.min.js"></script>
    <link rel="icon" href="../images/AgTech-Logo.ico" type="image/x-icon">
    <style>
        .swal-button-container {
            display: flex;
            justify-content: center;
            align-items: center;
            margin: auto;
            width: 100px;
        }
        .swal-button--confirm {
            background-color: #DC143C;
        }
        .swal-button--confirm:hover {
            background-color: darkred !important;
        }
        .countdown-timer {
            margin-top: 20px;
            font-size: 17px;
            color: #DC143C;
        }
        .disabled {
            pointer-events: none;
            opacity: 0.5;
        }
    </style>
</head>
<body>
    <div class="login-container">
    <div class="logo-container">
                <img src="../images/AgTech-Logo.png" alt="AgTech Logo" class="logo">
                <h1>AgTech</h1>
            </div>
            <div class="right">
                <div class="form-container">
                <p class="form-title">Welcome to AgTech</p>
        <form id="loginForm" class="login-form" action="Login.php" method="POST">
            <div class="form-group">
                <label for="email_or_phone">Email or Phone</label>
                <input type="text" class="input" id="email_or_phone" name="email_or_phone" value="<?php echo isset($_SESSION['email_or_phone']) && isset($_SESSION['error']) ? htmlspecialchars($_SESSION['email_or_phone']) : ''; ?>" required>
            </div>
            <div class="form-group">
            <label>Password</label>
             <div class="input-group" id="show_hide_password">
                <input type="password" class="form-control" id="password" name="password" required>
                <div class="input-group-addon">
                    <a href=""><i class="bi bi-eye-slash" aria-hidden="true"></i></a>
                </div>
            </div>
    </div>
            <div class="form-group">
                <a href="../Verification/Forgot_pass.php" class="forgot-password">Forgot Password?</a>
            </div>
            <button type="submit" id="loginButton" class="<?php echo isset($_SESSION['remaining_time']) && $_SESSION['remaining_time'] > 0 ? 'disabled' : ''; ?>">Login</button>
            <p>Don't have an account? <a href="../Verification/Register.php" class="register-link">Register</a></p>
            </div>

    </form>
    </div>
    </div>

    <?php
    if (isset($_SESSION['error'])) {
        echo "<script>
            document.addEventListener('DOMContentLoaded', function() {
                swal({
                    title: 'Error!',
                    text: '" . $_SESSION['error'] . "',
                    icon: 'error',
                    button: {
                        className: 'swal-button--confirm'
                    }
                });
            });
        </script>";
        unset($_SESSION['error']);
    }

    if (isset($_SESSION['remaining_time']) && $_SESSION['remaining_time'] > 0) {
        $remainingTime = $_SESSION['remaining_time'];
        echo "<script>
            document.addEventListener('DOMContentLoaded', function() {
                let remainingTime = $remainingTime;
                swal({
                    title: 'Too many attempts.',
                    text: 'Please try again after ' + remainingTime + ' seconds.',
                    buttons: false,
                    closeOnClickOutside: false
                });

                let countdownInterval = setInterval(function() {
                    remainingTime--;
                    if (remainingTime > 0) {
                        swal({
                            title: 'Too many attempts.',
                            text: 'Please try again after ' + remainingTime + ' seconds.',
                            buttons: false,
                            closeOnClickOutside: false
                        });
                    } else {
                        clearInterval(countdownInterval);
                        swal({
                            title: 'You can now attempt logging in again.',
                            icon: 'success',
                            button: {
                                text: 'OK',
                                className: 'swal-button--confirm'
                            }
                        }).then(() => {
                            // Send AJAX request to reset the login attempts
                            $.ajax({
                                url: 'reset_attempts.php',
                                method: 'POST',
                                success: function(response) {
                                    let result = JSON.parse(response);
                                    if (result.status === 'success') {
                                        window.location.reload();
                                    } else {
                                        swal({
                                            title: 'Error!',
                                            text: result.message,
                                            icon: 'error',
                                            button: {
                                                className: 'swal-button--confirm'
                                            }
                                        });
                                    }
                                }
                            });
                        });
                    }
                }, 1000);
            });
        </script>";
        unset($_SESSION['remaining_time']);
    }
    ?>

<script>
    const passwordInput = document.getElementById('password');
    const showPasswordIcon = document.getElementById('showPassword');
    const hidePasswordIcon = document.getElementById('hidePassword');
    const form = document.querySelector('form');
    const loader = document.getElementById('loading-spinner');

    // Function to toggle password visibility and icons
    function togglePasswordVisibility() {
        const hasPassword = passwordInput.value !== '';
        if (hasPassword) {
            showPasswordIcon.classList.remove('d-none');
        } else {
            showPasswordIcon.classList.add('d-none');
            hidePasswordIcon.classList.add('d-none');
        }
    }

    // Event listener for showing password
    showPasswordIcon.addEventListener('click', function() {
        passwordInput.type = 'text';
        showPasswordIcon.classList.add('d-none');
        hidePasswordIcon.classList.remove('d-none');
    });

    // Event listener for hiding password
    hidePasswordIcon.addEventListener('click', function() {
        passwordInput.type = 'password';
        hidePasswordIcon.classList.add('d-none');
        showPasswordIcon.classList.remove('d-none');
    });

    // Initially hide the icons if password field is empty
    togglePasswordVisibility();

    // Add input event listener to toggle icon visibility
    passwordInput.addEventListener('input', togglePasswordVisibility);

    // Show loader on form submission
    form.addEventListener('submit', function() {
        loader.classList.remove('d-none'); // Show loader
    });
</script>

<script>
    $(document).ready(function() {
    $("#show_hide_password a").on('click', function(event) {
        event.preventDefault();
        if($('#show_hide_password input').attr("type") == "text"){
            $('#show_hide_password input').attr('type', 'password');
            $('#show_hide_password i').addClass( "bi-eye-slash" );
            $('#show_hide_password i').removeClass( "bi-eye" );
        }else if($('#show_hide_password input').attr("type") == "password"){
            $('#show_hide_password input').attr('type', 'text');
            $('#show_hide_password i').removeClass( "bi-eye-slash" );
            $('#show_hide_password i').addClass( "bi-eye" );
        }
    });
});
</script>
</body>
</html>
