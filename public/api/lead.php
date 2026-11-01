<?php
// Приём заявок с формы. Статический сайт на Beget: Node там нет, поэтому PHP.
// Заменяет прежний Next.js-маршрут /api/lead.

// Куда отправлять заявки. Пока пусто: скрипт только проверяет данные и ничего не отправляет
// (демо-режим, форма показывает «Заявка отправлена»). Для работы укажите почту заказчика.
const LEAD_TO = '';
const LEAD_FROM = ''; // адрес на домене сайта, иначе письма уйдут в спам

header('Content-Type: application/json; charset=utf-8');

function reply(int $code, array $body): void {
    http_response_code($code);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

function clean($v, int $max): string {
    return is_string($v) ? mb_substr(trim($v), 0, $max) : '';
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') reply(405, ['ok' => false, 'error' => 'method']);

$body = json_decode(file_get_contents('php://input'), true);
if (!is_array($body)) reply(400, ['ok' => false, 'error' => 'bad_request']);

// Скрытое поле-ловушка для ботов: притворяемся, что всё хорошо
if (clean($body['website'] ?? '', 100) !== '') reply(200, ['ok' => true]);

$name = clean($body['name'] ?? '', 100);
$phone = clean($body['phone'] ?? '', 40);
if ($name === '' || strlen(preg_replace('/\D/', '', $phone)) < 10) {
    reply(422, ['ok' => false, 'error' => 'invalid']);
}
$facade = clean($body['facade'] ?? '', 200);
$comment = clean($body['comment'] ?? '', 2000);

if (LEAD_TO === '') reply(200, ['ok' => true, 'demo' => true]); // демо-режим, см. LEAD_TO

$text = "Имя: $name\nТелефон: $phone\nФасад: $facade\nКомментарий: $comment\n";
$headers = "From: " . LEAD_FROM . "\r\nContent-Type: text/plain; charset=utf-8";
$ok = mail(LEAD_TO, '=?UTF-8?B?' . base64_encode('Заявка с сайта') . '?=', $text, $headers);

reply($ok ? 200 : 500, ['ok' => $ok]);
