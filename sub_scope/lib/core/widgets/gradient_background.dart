import 'package:flutter/material.dart';
import 'dart:math' as math;

/// Floating decorative orb with gradient and animation
class FloatingOrb extends StatefulWidget {
  final double size;
  final List<Color> colors;
  final Duration duration;
  final Offset initialPosition;

  const FloatingOrb({
    super.key,
    this.size = 100,
    this.colors = const [Color(0xFFFD79A8), Color(0xFFFF7675)],
    this.duration = const Duration(seconds: 4),
    this.initialPosition = const Offset(0, 0),
  });

  @override
  State<FloatingOrb> createState() => _FloatingOrbState();
}

class _FloatingOrbState extends State<FloatingOrb>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<Offset> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: widget.duration,
      vsync: this,
    )..repeat(reverse: true);

    final random = math.Random();
    final endX = widget.initialPosition.dx + (random.nextDouble() * 40 - 20);
    final endY = widget.initialPosition.dy + (random.nextDouble() * 40 - 20);

    _animation = Tween<Offset>(
      begin: widget.initialPosition,
      end: Offset(endX, endY),
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Positioned(
          left: _animation.value.dx,
          top: _animation.value.dy,
          child: Container(
            width: widget.size,
            height: widget.size,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: LinearGradient(
                colors: widget.colors,
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              boxShadow: [
                BoxShadow(
                  color: widget.colors.first.withOpacity(0.3),
                  blurRadius: 30,
                  spreadRadius: 10,
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

/// Gradient background container with floating orbs
class GradientBackground extends StatelessWidget {
  final Widget child;
  final bool showOrbs;

  const GradientBackground({
    super.key,
    required this.child,
    this.showOrbs = true,
  });

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFFE3F2FD), Color(0xFFFAFAFA)],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
      child: Stack(
        children: [
          // Floating orbs
          if (showOrbs) ...[
            FloatingOrb(
              size: 120,
              colors: const [Color(0xFFFD79A8), Color(0xFFFF7675)],
              initialPosition: Offset(size.width * 0.8, 20),
              duration: const Duration(seconds: 5),
            ),
            FloatingOrb(
              size: 80,
              colors: const [Color(0xFFA29BFE), Color(0xFF6C5CE7)],
              initialPosition: Offset(size.width * 0.1, size.height * 0.3),
              duration: const Duration(seconds: 6),
            ),
            FloatingOrb(
              size: 60,
              colors: const [Color(0xFF74B9FF), Color(0xFF81ECEC)],
              initialPosition: Offset(size.width * 0.85, size.height * 0.6),
              duration: const Duration(seconds: 4),
            ),
          ],
          // Content
          child,
        ],
      ),
    );
  }
}
