<?php
// PHP Example for Top-up API
// วิธีใช้: วางไฟล์นี้ใน htdocs แล้วเปิดผ่าน browser

class TopUpAPI {
    private $baseUrl;
    
    public function __construct($baseUrl = 'http://localhost:3002') {
        $this->baseUrl = $baseUrl;
    }
    
    // สร้างรายการเติมเงิน
    public function createTopUp($angpaoLink, $phoneNumber, $amount = null) {
        $url = $this->baseUrl . '/api/topup';
        $data = [
            'angpao_link' => $angpaoLink,
            'phone_number' => $phoneNumber,
            'amount' => $amount
        ];
        
        $response = $this->sendRequest('POST', $url, $data);
        return $response;
    }
    
    // ตรวจสอบสถานะรายการ
    public function getTransactionStatus($transactionId) {
        $url = $this->baseUrl . '/api/topup/' . $transactionId;
        $response = $this->sendRequest('GET', $url);
        return $response;
    }
    
    // ดูยอดเงินคงเหลือ
    public function getBalance() {
        $url = $this->baseUrl . '/api/balance';
        $response = $this->sendRequest('GET', $url);
        return $response;
    }
    
    // ดูรายการทั้งหมด
    public function getTransactions($status = null, $limit = 50) {
        $url = $this->baseUrl . '/api/transactions';
        $params = [];
        if ($status) $params['status'] = $status;
        if ($limit) $params['limit'] = $limit;
        
        if (!empty($params)) {
            $url .= '?' . http_build_query($params);
        }
        
        $response = $this->sendRequest('GET', $url);
        return $response;
    }
    
    private function sendRequest($method, $url, $data = null) {
        $ch = curl_init();
        
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        
        if ($method === 'POST' && $data) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json'
            ]);
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        return [
            'status_code' => $httpCode,
            'data' => json_decode($response, true)
        ];
    }
}

// ตัวอย่างการใช้งาน
$api = new TopUpAPI('http://localhost:3002');

// สร้างรายการเติมเงิน
echo "<h2>สร้างรายการเติมเงิน</h2>";
$angpaoLink = "https://gift.truemoney.com/campaign/?v=example";
$phoneNumber = "0812345678";
$amount = 100;

$result = $api->createTopUp($angpaoLink, $phoneNumber, $amount);
echo "<pre>" . print_r($result, true) . "</pre>";

if ($result['data']['success']) {
    $transactionId = $result['data']['transaction']['id'];
    echo "<p>Transaction ID: <strong>{$transactionId}</strong></p>";
    
    // ตรวจสอบสถานะรายการ
    echo "<h2>ตรวจสอบสถานะรายการ</h2>";
    sleep(4); // รอสักครู่ให้ประมวลผล
    $status = $api->getTransactionStatus($transactionId);
    echo "<pre>" . print_r($status, true) . "</pre>";
}

// ดูยอดเงินคงเหลือ
echo "<h2>ยอดเงินคงเหลือ</h2>";
$balance = $api->getBalance();
echo "<pre>" . print_r($balance, true) . "</pre>";

// ดูรายการทั้งหมด
echo "<h2>รายการทั้งหมด</h2>";
$transactions = $api->getTransactions();
echo "<pre>" . print_r($transactions, true) . "</pre>";
?>
