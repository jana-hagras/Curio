/// Demo data seeded on first app launch.
class SeedData {
  SeedData._();

  static List<Map<String, dynamic>> get users => [
        {
          'id': 1,
          'firstName': 'Jana',
          'middleName': null,
          'lastName': 'Hagras',
          'email': 'jana@curio.com',
          'password': 'password123',
          'phone': '+20 100 123 4567',
          'address': 'Cairo, Egypt',
          'type': 'Buyer',
          'profileImage': '',
          'joinDate': '2025-12-01',
          'country': 'Egypt',
          'bio': null,
          'status': 'Active',
          'verified': true,
          'isBanned': false,
        },
        {
          'id': 2,
          'firstName': 'Youssef',
          'middleName': null,
          'lastName': 'El Sayed',
          'email': 'youssef@artisan.com',
          'password': 'password123',
          'phone': '+20 111 987 6543',
          'address': 'Luxor, Egypt',
          'type': 'Artisan',
          'profileImage': '',
          'joinDate': '2025-10-15',
          'country': 'Egypt',
          'bio': 'Master potter with 15 years of experience specializing in ancient Egyptian motifs.',
          'status': 'Active',
          'verified': true,
          'isBanned': false,
        },
        {
          'id': 3,
          'firstName': 'Admin',
          'middleName': null,
          'lastName': 'User',
          'email': 'admin@curio.com',
          'password': 'admin123',
          'phone': '+20 100 000 0000',
          'address': 'Cairo, Egypt',
          'type': 'Admin',
          'profileImage': '',
          'joinDate': '2025-01-01',
          'country': 'Egypt',
          'bio': null,
          'status': 'Active',
          'verified': true,
          'isBanned': false,
        },
      ];

  static List<Map<String, dynamic>> get marketItems => [
        {
          'id': 1,
          'artisan_id': 2,
          'item': 'Handmade Clay Vase',
          'description':
              'This exquisite handmade clay vase is a testament to traditional Egyptian craftsmanship. Each piece is unique, featuring intricate patterns inspired by ancient Pharaonic motifs. Created using techniques passed down through generations of master potters.',
          'image': 'assets/images/product_vase.png',
          'availQuantity': 12,
          'price': 450.0,
          'category': 'Pottery',
          'dateAdded': '2026-03-01',
          'artisanName': 'Youssef El Sayed',
        },
        {
          'id': 2,
          'artisan_id': 2,
          'item': 'Beaded Jewelry Box',
          'description':
              'A stunning hand-crafted jewelry box adorned with colorful beads in traditional Egyptian patterns. Perfect for storing treasured accessories.',
          'image': 'assets/images/product_jewelry.png',
          'availQuantity': 8,
          'price': 320.0,
          'category': 'Jewelry',
          'dateAdded': '2026-02-20',
          'artisanName': 'Youssef El Sayed',
        },
        {
          'id': 3,
          'artisan_id': 2,
          'item': 'Woven Basket Set',
          'description':
              'Set of three beautifully woven baskets using natural palm fibers. Traditional Egyptian weaving technique passed down for centuries.',
          'image': 'assets/images/product_basket.png',
          'availQuantity': 15,
          'price': 280.0,
          'category': 'Textiles',
          'dateAdded': '2026-02-15',
          'artisanName': 'Youssef El Sayed',
        },
        {
          'id': 4,
          'artisan_id': 2,
          'item': 'Ceramic Tea Set',
          'description':
              'An elegant ceramic tea set for six, featuring hand-painted lotus flower designs inspired by ancient Egyptian art.',
          'image': 'assets/images/product_ceramic.png',
          'availQuantity': 5,
          'price': 550.0,
          'category': 'Pottery',
          'dateAdded': '2026-01-28',
          'artisanName': 'Youssef El Sayed',
        },
        {
          'id': 5,
          'artisan_id': 2,
          'item': 'Pharaonic Wall Art',
          'description':
              'Hand-carved wooden wall art depicting scenes from ancient Egyptian mythology. Gold leaf accents add a touch of royal elegance.',
          'image': 'assets/images/product_wallart.png',
          'availQuantity': 3,
          'price': 680.0,
          'category': 'Decor',
          'dateAdded': '2026-01-15',
          'artisanName': 'Youssef El Sayed',
        },
        {
          'id': 6,
          'artisan_id': 2,
          'item': 'Hand-Stitched Cushion',
          'description':
              'Luxurious hand-stitched cushion cover with geometric patterns inspired by Islamic art. Made with premium Egyptian cotton.',
          'image': 'assets/images/product_cushion.png',
          'availQuantity': 20,
          'price': 190.0,
          'category': 'Textiles',
          'dateAdded': '2026-03-10',
          'artisanName': 'Youssef El Sayed',
        },
      ];

  static List<Map<String, dynamic>> get orders => [
        {
          'id': 1,
          'orderId': 'ORD-1024',
          'buyerId': 1,
          'orderDate': '2026-03-25',
          'deliveryAddress': 'Cairo, Egypt',
          'status': 'Delivered',
          'buyerName': 'Jana Hagras',
          'items': [
            {'productId': 1, 'name': 'Handmade Clay Vase', 'price': 450.0, 'quantity': 1}
          ],
        },
        {
          'id': 2,
          'orderId': 'ORD-1023',
          'buyerId': 1,
          'orderDate': '2026-03-20',
          'deliveryAddress': 'Cairo, Egypt',
          'status': 'In Transit',
          'buyerName': 'Jana Hagras',
          'items': [
            {'productId': 2, 'name': 'Beaded Jewelry Box', 'price': 320.0, 'quantity': 1}
          ],
        },
        {
          'id': 3,
          'orderId': 'ORD-1020',
          'buyerId': 1,
          'orderDate': '2026-03-18',
          'deliveryAddress': 'Cairo, Egypt',
          'status': 'Processing',
          'buyerName': 'Jana Hagras',
          'items': [
            {'productId': 3, 'name': 'Woven Basket Set', 'price': 280.0, 'quantity': 2}
          ],
        },
      ];

  static List<Map<String, dynamic>> get chatMessages => [
        {
          'id': '1',
          'senderId': 1,
          'receiverId': 2,
          'message': "Hi! I'm interested in your clay vase collection.",
          'timestamp': '2026-03-28T10:00:00',
          'isMe': true,
        },
        {
          'id': '2',
          'senderId': 2,
          'receiverId': 1,
          'message': 'Hello! Thank you for reaching out. Which style do you prefer?',
          'timestamp': '2026-03-28T10:02:00',
          'isMe': false,
        },
        {
          'id': '3',
          'senderId': 1,
          'receiverId': 2,
          'message': "I'd love something with ancient Egyptian motifs.",
          'timestamp': '2026-03-28T10:05:00',
          'isMe': true,
        },
        {
          'id': '4',
          'senderId': 2,
          'receiverId': 1,
          'message': 'I can create a custom piece for you. Let me send some sketches.',
          'timestamp': '2026-03-28T10:07:00',
          'isMe': false,
        },
      ];

  static List<Map<String, dynamic>> get notifications => [
        {
          'id': '1',
          'title': 'Order Shipped',
          'body': 'Your vase is on its way!',
          'icon': 'local_shipping',
          'color': 'primary',
          'time': '2m ago',
          'isRead': false,
        },
        {
          'id': '2',
          'title': 'New Message',
          'body': 'Youssef sent you a message',
          'icon': 'chat_bubble',
          'color': 'info',
          'time': '15m ago',
          'isRead': false,
        },
        {
          'id': '3',
          'title': 'Order Confirmed',
          'body': 'Order #1024 has been confirmed',
          'icon': 'check_circle',
          'color': 'success',
          'time': '1h ago',
          'isRead': true,
        },
        {
          'id': '4',
          'title': 'Price Drop',
          'body': 'Beaded Box is now EGP 280!',
          'icon': 'trending_down',
          'color': 'warning',
          'time': '3h ago',
          'isRead': true,
        },
        {
          'id': '5',
          'title': 'Welcome!',
          'body': 'Start exploring Egyptian crafts',
          'icon': 'auto_awesome',
          'color': 'purple',
          'time': '1d ago',
          'isRead': true,
        },
      ];

  static List<Map<String, dynamic>> get customOrders => [
        {
          'id': 1,
          'buyerId': 1,
          'buyerName': 'Jana Hagras',
          'artisanId': 2,
          'category': 'Pottery',
          'description': 'A large decorative vase with Nefertiti engraving',
          'budget': 800.0,
          'deadline': '3 weeks',
          'status': 'Pending',
          'dateSubmitted': '2026-03-15',
        },
      ];
}
