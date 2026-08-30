<?php

namespace Tests\Feature;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class TrustedProxyTest extends TestCase
{
    public function test_forwarded_ip_and_scheme_are_used_from_a_trusted_proxy(): void
    {
        config(['trustedproxy.proxies' => '10.0.0.0/8']);
        $this->registerProbeRoute();

        $this->withServerVariables(['REMOTE_ADDR' => '10.42.0.12'])
            ->withHeaders([
                'X-Forwarded-For' => '203.0.113.25',
                'X-Forwarded-Proto' => 'https',
            ])
            ->getJson('/_tests/proxy-context')
            ->assertOk()
            ->assertExactJson([
                'ip' => '203.0.113.25',
                'secure' => true,
            ]);
    }

    public function test_forwarded_headers_are_ignored_from_an_untrusted_caller(): void
    {
        config(['trustedproxy.proxies' => '10.0.0.0/8']);
        $this->registerProbeRoute();

        $this->withServerVariables(['REMOTE_ADDR' => '198.51.100.40'])
            ->withHeaders([
                'X-Forwarded-For' => '203.0.113.25',
                'X-Forwarded-Proto' => 'https',
            ])
            ->getJson('/_tests/proxy-context')
            ->assertOk()
            ->assertExactJson([
                'ip' => '198.51.100.40',
                'secure' => false,
            ]);
    }

    private function registerProbeRoute(): void
    {
        Route::get('/_tests/proxy-context', fn (Request $request) => response()->json([
            'ip' => $request->ip(),
            'secure' => $request->isSecure(),
        ]));
    }
}
