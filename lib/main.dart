import 'package:flutter/material.dart';

void main() {
  runApp(const PorApp());
}

class PorApp extends StatelessWidget {
  const PorApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'PorApp',
      theme: ThemeData(primarySwatch: Colors.blue, useMaterial3: true),
      home: const MainScreen(),
    );
  }
}

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _currentIndex = 0;

  final List<Widget> _pages = [
    const HomePage(),
    const AiChatPage(),
    const PaymentPlansPage(),
    const StoresPage(),
    const EstatePage(),
  ];

  final List<String> _titles = [
    'Porathahomes',
    'AI Chat',
    'Payment Plans',
    'Stores',
    'Estate',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_titles[_currentIndex]),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: _pages[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        selectedItemColor: Colors.blue,
        unselectedItemColor: Colors.grey,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.chat),
            label: 'AI Chat',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.payment),
            label: 'Payment Plans',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.store),
            label: 'Stores',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.business),
            label: 'Estate',
          ),
        ],
      ),
    );
  }
}

// Page widgets - all display the same shimmer button content
class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return const ShimmerButtonPage();
  }
}

class AiChatPage extends StatelessWidget {
  const AiChatPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const ShimmerButtonPage();
  }
}

class PaymentPlansPage extends StatelessWidget {
  const PaymentPlansPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const ShimmerButtonPage();
  }
}

class StoresPage extends StatelessWidget {
  const StoresPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const ShimmerButtonPage();
  }
}

class EstatePage extends StatelessWidget {
  const EstatePage({super.key});

  @override
  Widget build(BuildContext context) {
    return const ShimmerButtonPage();
  }
}

// Extracted the shimmer button content into a reusable widget
class ShimmerButtonPage extends StatelessWidget {
  const ShimmerButtonPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const SingleChildScrollView(
      child: Padding(
        padding: EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Tags',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 8),
            TagButtonRow(),
            SizedBox(height: 24),
            Text(
              'discount offers',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 8),
            SmallButtonRow(),
            SizedBox(height: 24),
            Text(
              'NEW PROPERTIES',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 8),
            MediumButtonRow(),
            SizedBox(height: 24),
            Text(
              'swap deals',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 8),
            LargeButtonRow(),
            SizedBox(height: 24),
            Text(
              'in your location',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 8),
            CardButtonColumn(),
          ],
        ),
      ),
    );
  }
}

// Base Shimmer Button Widget
class ShimmerButton extends StatefulWidget {
  final Widget child;
  final double width;
  final double height;
  final Gradient gradient;
  final VoidCallback? onTap;

  const ShimmerButton({
    super.key,
    required this.child,
    required this.width,
    required this.height,
    required this.gradient,
    this.onTap,
  });

  @override
  State<ShimmerButton> createState() => _ShimmerButtonState();
}

class _ShimmerButtonState extends State<ShimmerButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    );
    _animation = Tween<double>(begin: -1.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.linear),
    );
    _animationController.repeat();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: widget.onTap,
      child: AnimatedBuilder(
        animation: _animation,
        builder: (context, child) {
          return Container(
            width: widget.width,
            height: widget.height,
            decoration: BoxDecoration(
              gradient: widget.gradient,
              borderRadius: BorderRadius.circular(8),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 4,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Stack(
              children: [
                widget.child,
                Positioned.fill(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.centerLeft,
                          end: Alignment.centerRight,
                          colors: [
                            Colors.white.withOpacity(0.0),
                            Colors.white.withOpacity(0.3),
                            Colors.white.withOpacity(0.0),
                          ],
                          stops: const [0.0, 0.5, 1.0],
                          transform: GradientRotation(
                            _animation.value * 3.14159,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

// Tag Button Widget
class TagButton extends StatelessWidget {
  final String text;
  final Gradient gradient;

  const TagButton({super.key, required this.text, required this.gradient});

  @override
  Widget build(BuildContext context) {
    return ShimmerButton(
      width: 40,
      height: 32,
      gradient: gradient,
      onTap: () => _showButtonTapped(context, 'Tag: $text'),
      child: Center(
        child: Text(
          text,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 12,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }
}

// Small Button Widget
class SmallButton extends StatelessWidget {
  final String text;
  final Gradient gradient;

  const SmallButton({super.key, required this.text, required this.gradient});

  @override
  Widget build(BuildContext context) {
    return ShimmerButton(
      width: 100,
      height: 40,
      gradient: gradient,
      onTap: () => _showButtonTapped(context, 'Small: $text'),
      child: Center(
        child: Text(
          text,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }
}

// Medium Button Widget
class MediumButton extends StatelessWidget {
  final String text;
  final Gradient gradient;

  const MediumButton({super.key, required this.text, required this.gradient});

  @override
  Widget build(BuildContext context) {
    return ShimmerButton(
      width: 120,
      height: 50,
      gradient: gradient,
      onTap: () => _showButtonTapped(context, 'Medium: $text'),
      child: Center(
        child: Text(
          text,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}

// Large Button Widget
class LargeButton extends StatelessWidget {
  final String text;
  final Gradient gradient;

  const LargeButton({super.key, required this.text, required this.gradient});

  @override
  Widget build(BuildContext context) {
    return ShimmerButton(
      width: 150,
      height: 60,
      gradient: gradient,
      onTap: () => _showButtonTapped(context, 'Large: $text'),
      child: Center(
        child: Text(
          text,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}

// Card Button Widget
class CardButton extends StatelessWidget {
  final String title;
  final String subtitle;
  final Gradient gradient;

  const CardButton({
    super.key,
    required this.title,
    required this.subtitle,
    required this.gradient,
  });

  @override
  Widget build(BuildContext context) {
    return ShimmerButton(
      width: double.infinity,
      height: 120,
      gradient: gradient,
      onTap: () => _showButtonTapped(context, 'Card: $title'),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              title,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              subtitle,
              style: const TextStyle(color: Colors.white70, fontSize: 14),
            ),
          ],
        ),
      ),
    );
  }
}

// Button Row Widgets
class TagButtonRow extends StatelessWidget {
  const TagButtonRow({super.key});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 32,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: 6,
        separatorBuilder: (context, index) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          return TagButton(
            text: 'Tag ${index + 1}',
            gradient: _getGradient(index),
          );
        },
      ),
    );
  }
}

class SmallButtonRow extends StatelessWidget {
  const SmallButtonRow({super.key});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 40,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: 5,
        separatorBuilder: (context, index) => const SizedBox(width: 12),
        itemBuilder: (context, index) {
          return SmallButton(
            text: 'Small ${index + 1}',
            gradient: _getGradient(index + 6),
          );
        },
      ),
    );
  }
}

class MediumButtonRow extends StatelessWidget {
  const MediumButtonRow({super.key});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 50,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: 4,
        separatorBuilder: (context, index) => const SizedBox(width: 16),
        itemBuilder: (context, index) {
          return MediumButton(
            text: 'Medium ${index + 1}',
            gradient: _getGradient(index + 11),
          );
        },
      ),
    );
  }
}

class LargeButtonRow extends StatelessWidget {
  const LargeButtonRow({super.key});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 60,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: 4,
        separatorBuilder: (context, index) => const SizedBox(width: 20),
        itemBuilder: (context, index) {
          return LargeButton(
            text: 'Large ${index + 1}',
            gradient: _getGradient(index + 15),
          );
        },
      ),
    );
  }
}

class CardButtonColumn extends StatelessWidget {
  const CardButtonColumn({super.key});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 400,
      child: ListView.separated(
        itemCount: 4,
        separatorBuilder: (context, index) => const SizedBox(height: 16),
        itemBuilder: (context, index) {
          return CardButton(
            title: 'Card Button ${index + 1}',
            subtitle: 'This is a card-style button with shimmer effect',
            gradient: _getGradient(index + 19),
          );
        },
      ),
    );
  }
}

// Utility Functions
Gradient _getGradient(int index) {
  final gradients = [
    const LinearGradient(
      colors: [Colors.purple, Colors.blue],
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    ),
    const LinearGradient(
      colors: [Colors.orange, Colors.red],
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    ),
    const LinearGradient(
      colors: [Colors.green, Colors.teal],
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    ),
    const LinearGradient(
      colors: [Colors.pink, Colors.purple],
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    ),
    const LinearGradient(
      colors: [Colors.cyan, Colors.blue],
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    ),
    const LinearGradient(
      colors: [Colors.amber, Colors.orange],
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    ),
    const LinearGradient(
      colors: [Colors.indigo, Colors.purple],
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    ),
  ];
  return gradients[index % gradients.length];
}

void _showButtonTapped(BuildContext context, String buttonType) {
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: Text('$buttonType tapped!'),
      duration: const Duration(seconds: 1),
    ),
  );
}