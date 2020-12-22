<!DOCTYPE html>
<html>
<head>
    <title>Koel</title>

    <meta name="description" content="{{ config('app.tagline') }}">
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
    <meta name="mobile-web-app-capable" content="yes">

    <meta name="theme-color" content="#282828">
    <meta name="msapplication-navbutton-color" content="#282828">

    <base href="{{ asset('') }}">
    <link rel="manifest" href="{{ static_url('manifest.json') }}" />
    <meta name="msapplication-config" content="{{ static_url('browserconfig.xml') }}" />
    <link rel="icon" type="image/x-icon" href="{{ static_url('img/favicon.ico') }}" />
    <link rel="icon" href="{{ static_url('img/icon.png') }}">
    <link rel="apple-touch-icon" href="{{ static_url('img/icon.png') }}">

    <link rel="stylesheet" href="{{ asset_rev('/css/app.css') }}">
</head>
<body>
    <div id="app"></div>

    <noscript>It may sound funny, but Koel requires JavaScript to sing. Please enable it.</noscript>
    @include('client-js-vars')
    <script src="{{ asset_rev('/js/app.js') }}"></script>
</body>
</html>
