import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';

/// Spending breakdown pie chart widget
class SpendingPieChart extends StatelessWidget {
  final Map<String, double> breakdown;

  const SpendingPieChart({
    super.key,
    required this.breakdown,
  });

  @override
  Widget build(BuildContext context) {
    if (breakdown.isEmpty) {
      return const Center(
        child: Text('No data available'),
      );
    }

    // Generate colors for each service
    final colors = _generateColors(breakdown.length);
    final entries = breakdown.entries.toList();

    return Column(
      children: [
        SizedBox(
          height: 200,
          child: PieChart(
            PieChartData(
              sections: entries.asMap().entries.map((entry) {
                final index = entry.key;
                final data = entry.value;

                return PieChartSectionData(
                  value: data.value,
                  title: '',
                  color: colors[index],
                  radius: 60,
                );
              }).toList(),
              sectionsSpace: 2,
              centerSpaceRadius: 40,
            ),
          ),
        ),
        const SizedBox(height: 16),
        Wrap(
          spacing: 12,
          runSpacing: 8,
          children: entries.asMap().entries.map((entry) {
            final index = entry.key;
            final data = entry.value;

            return Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 12,
                  height: 12,
                  decoration: BoxDecoration(
                    color: colors[index],
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 4),
                Text(
                  data.key,
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ],
            );
          }).toList(),
        ),
      ],
    );
  }

  List<Color> _generateColors(int count) {
    return List.generate(count, (index) {
      final hue = (index * 360 / count) % 360;
      return HSLColor.fromAHSL(1.0, hue, 0.7, 0.5).toColor();
    });
  }
}
