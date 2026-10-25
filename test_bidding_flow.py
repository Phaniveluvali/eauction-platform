import requests
import json

try:
    r = requests.get('http://10.104.0.119:8080/api/v1/auctions')
    auctions = r.json()
    active_auctions = [a for a in auctions if a.get('status') == 'ACTIVE']
    print(f'Total active auctions: {len(active_auctions)}')

    if active_auctions:
        auc = active_auctions[0]
        auc_id = auc['id']
        curr_bid = float(auc.get('currentHighestBid') or auc.get('startPrice') or 10000)
        print(f'Target Auction ID: {auc_id}')
        print(f'Initial Highest Bid: AED {curr_bid:,.2f}')

        # Test 1: Bid lower than or equal to current bid -> MUST REJECT
        payload_low = {'bidAmount': curr_bid, 'bidderId': 'buyerdemo'}
        r_low = requests.post(f'http://10.104.0.119:8080/api/v1/auctions/{auc_id}/bids', json=payload_low)
        print(f'\n--- TEST 1: Submit Equal Bid ({curr_bid}) ---')
        print(f'HTTP Status: {r_low.status_code}')
        print(f'Response: {r_low.text}')

        # Test 2: Add 5,000 AED to current bid -> MUST SUCCEED
        new_bid = curr_bid + 5000
        payload_high = {'bidAmount': new_bid, 'bidderId': 'buyerdemo', 'confirmSelfOutbid': True}
        r_high = requests.post(f'http://10.104.0.119:8080/api/v1/auctions/{auc_id}/bids', json=payload_high)
        print(f'\n--- TEST 2: Submit +5,000 AED Increment ({new_bid}) ---')
        print(f'HTTP Status: {r_high.status_code}')
        print(f'Response: {r_high.text}')

        # Test 3: Attempting to submit previous bid again -> MUST REJECT
        r_prev = requests.post(f'http://10.104.0.119:8080/api/v1/auctions/{auc_id}/bids', json={'bidAmount': curr_bid, 'bidderId': 'userdemo'})
        print(f'\n--- TEST 3: Submit Previous Lower Bid ({curr_bid}) against ({new_bid}) ---')
        print(f'HTTP Status: {r_prev.status_code}')
        print(f'Response: {r_prev.text}')

        # Test 4: Another user outbids with +500 AED -> MUST SUCCEED
        next_bid = new_bid + 500
        r_outbid = requests.post(f'http://10.104.0.119:8080/api/v1/auctions/{auc_id}/bids', json={'bidAmount': next_bid, 'bidderId': 'userdemo'})
        print(f'\n--- TEST 4: Another User Submits +500 AED ({next_bid}) ---')
        print(f'HTTP Status: {r_outbid.status_code}')
        print(f'Response: {r_outbid.text}')

except Exception as ex:
    print('Error during test execution:', ex)
