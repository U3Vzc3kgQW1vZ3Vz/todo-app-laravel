<?php
echo "Hello from PHP-FPM!";
// This will prevent the script from exiting immediately
sleep(3600); // Keep the process alive for 1 hour, or until Cloud Run terminates it
?>