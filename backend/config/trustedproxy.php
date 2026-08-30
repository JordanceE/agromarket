<?php

return [
    // Keep this unset when PHP is directly reachable. Use "*" only when the
    // application service is isolated behind a controlled reverse proxy.
    'proxies' => env('TRUSTED_PROXIES') ?: null,
];
