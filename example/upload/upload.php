<?php
header("Expires: Thu, 24 May 1994 08:00:00 GMT");
header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
header("Cache-Control: no-store, no-cache, must-revalidate");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
echo('{"success" : false, "message": "Only a simple demo."}');
?>