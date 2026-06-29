"""
Python Example for Top-up API
วิธีใช้: python python_example.py
ต้องติดตั้ง requests: pip install requests
"""

import requests
import time
import json

class TopUpAPI:
    def __init__(self, base_url='http://localhost:3002'):
        self.base_url = base_url
    
    def create_topup(self, angpao_link, phone_number, amount=None):
        """สร้างรายการเติมเงิน"""
        url = f"{self.base_url}/api/topup"
        data = {
            'angpao_link': angpao_link,
            'phone_number': phone_number,
            'amount': amount
        }
        
        try:
            response = requests.post(url, json=data)
            return {
                'status_code': response.status_code,
                'data': response.json()
            }
        except requests.exceptions.RequestException as e:
            return {
                'status_code': 500,
                'data': {'success': False, 'error': str(e)}
            }
    
    def get_transaction_status(self, transaction_id):
        """ตรวจสอบสถานะรายการ"""
        url = f"{self.base_url}/api/topup/{transaction_id}"
        
        try:
            response = requests.get(url)
            return {
                'status_code': response.status_code,
                'data': response.json()
            }
        except requests.exceptions.RequestException as e:
            return {
                'status_code': 500,
                'data': {'success': False, 'error': str(e)}
            }
    
    def get_balance(self):
        """ดูยอดเงินคงเหลือ"""
        url = f"{self.base_url}/api/balance"
        
        try:
            response = requests.get(url)
            return {
                'status_code': response.status_code,
                'data': response.json()
            }
        except requests.exceptions.RequestException as e:
            return {
                'status_code': 500,
                'data': {'success': False, 'error': str(e)}
            }
    
    def get_transactions(self, status=None, limit=50):
        """ดูรายการทั้งหมด"""
        url = f"{self.base_url}/api/transactions"
        params = {}
        
        if status:
            params['status'] = status
        if limit:
            params['limit'] = limit
        
        try:
            response = requests.get(url, params=params)
            return {
                'status_code': response.status_code,
                'data': response.json()
            }
        except requests.exceptions.RequestException as e:
            return {
                'status_code': 500,
                'data': {'success': False, 'error': str(e)}
            }
    
    def reset_system(self):
        """รีเซ็ตระบบ (สำหรับทดสอบ)"""
        url = f"{self.base_url}/api/reset"
        
        try:
            response = requests.post(url)
            return {
                'status_code': response.status_code,
                'data': response.json()
            }
        except requests.exceptions.RequestException as e:
            return {
                'status_code': 500,
                'data': {'success': False, 'error': str(e)}
            }


def main():
    # สร้าง instance ของ API
    api = TopUpAPI('http://localhost:3002')
    
    print("=" * 50)
    print("TrueMoney Top-up API - Python Example")
    print("=" * 50)
    
    # ดูยอดเงินคงเหลือ
    print("\n1. ดูยอดเงินคงเหลือ")
    balance = api.get_balance()
    print(f"Status: {balance['status_code']}")
    print(f"Response: {json.dumps(balance['data'], indent=2, ensure_ascii=False)}")
    
    # สร้างรายการเติมเงิน
    print("\n2. สร้างรายการเติมเงิน")
    angpao_link = "https://gift.truemoney.com/campaign/?v=example"
    phone_number = "0812345678"
    amount = 100
    
    print(f"ลิงก์ซองอังเปา: {angpao_link}")
    print(f"เบอร์โทร: {phone_number}")
    print(f"จำนวนเงิน: {amount} บาท")
    
    result = api.create_topup(angpao_link, phone_number, amount)
    print(f"Status: {result['status_code']}")
    print(f"Response: {json.dumps(result['data'], indent=2, ensure_ascii=False)}")
    
    if result['data'].get('success'):
        transaction_id = result['data']['transaction']['id']
        print(f"\nTransaction ID: {transaction_id}")
        
        # รอสักครู่แล้วตรวจสอบสถานะ
        print("\n3. รอประมวลผล (4 วินาที)...")
        time.sleep(4)
        
        print("\n4. ตรวจสอบสถานะรายการ")
        status = api.get_transaction_status(transaction_id)
        print(f"Status: {status['status_code']}")
        print(f"Response: {json.dumps(status['data'], indent=2, ensure_ascii=False)}")
        
        # ดูยอดเงินคงเหลืออีกครั้ง
        print("\n5. ดูยอดเงินคงเหลือหลังเติมเงิน")
        balance = api.get_balance()
        print(f"Status: {balance['status_code']}")
        print(f"Response: {json.dumps(balance['data'], indent=2, ensure_ascii=False)}")
    
    # ดูรายการทั้งหมด
    print("\n6. ดูรายการทั้งหมด")
    transactions = api.get_transactions(limit=10)
    print(f"Status: {transactions['status_code']}")
    print(f"Response: {json.dumps(transactions['data'], indent=2, ensure_ascii=False)}")
    
    print("\n" + "=" * 50)
    print("เสร็จสิ้น!")
    print("=" * 50)


if __name__ == "__main__":
    main()
