import 'package:flutter/material.dart';

class my_widget_page extends StatefulWidget {
  const my_widget_page({super.key});

  @override
  State<my_widget_page> createState() => _my_widget_page_state();
}

enum Calendar { day, week, month, year }

class _my_widget_page_state extends State<my_widget_page> {
  static const List<(Color?, Color? background, ShapeBorder?)> customizations =
      <(Color?, Color?, ShapeBorder?)>[
        (null, null, null), // The FAB uses its default for null parameters.
        (null, Colors.green, null),
        (Colors.white, Colors.green, null),
        (Colors.white, Colors.green, CircleBorder()),
      ];
  int index = 0; // Selects the customization.

  Calendar calendarView = Calendar.day;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.primaryContainer,
          border: Border.all(color: Colors.grey, width: 1),
        ),

        child: Padding(
          padding: EdgeInsets.all(20),
          child: ListView(
            children: [
              Text('Button', style: TextStyle(fontSize: 10)),
              SizedBox(height: 10),
              Row(
                children: [
                  FilledButton(onPressed: () {}, child: const Text('Filled')),
                  SizedBox(width: 10),
                  FloatingActionButton.small(
                    onPressed: () {
                      // Add your onPressed code here!
                    },
                    child: const Icon(Icons.add),
                  ),
                  SizedBox(width: 10),
                  FloatingActionButton.small(
                    onPressed: () {
                      setState(() {
                        index = (index + 1) % customizations.length;
                      });
                    },
                    foregroundColor: customizations[index].$1,
                    backgroundColor: customizations[index].$2,
                    shape: customizations[index].$3,
                    child: const Icon(Icons.navigation),
                  ),
                  SizedBox(width: 10),
                  Ink(
                    decoration: const ShapeDecoration(
                      color: Colors.lightBlue,
                      shape: CircleBorder(),
                    ),
                    child: IconButton(
                      icon: const Icon(Icons.android),
                      color: const Color.fromARGB(255, 0, 0, 0),
                      onPressed: () {},
                    ),
                  ),
                  SizedBox(width: 10),
                  ElevatedButton(
                    child: const Text('Show Snackbar'),
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: const Text('Awesome Snackbar!'),
                          action: SnackBarAction(
                            label: 'Action',
                            onPressed: () {
                              // Code to execute.
                            },
                          ),
                        ),
                      );
                    },
                  ),
                ],
              ),
              SizedBox(height: 10),
              //单选按钮
              Row(
                children: [
                  SegmentedButton<Calendar>(
                    segments: const <ButtonSegment<Calendar>>[
                      ButtonSegment<Calendar>(
                        value: Calendar.day,
                        label: Text('Day'),
                        icon: Icon(Icons.calendar_view_day),
                      ),
                      ButtonSegment<Calendar>(
                        value: Calendar.week,
                        label: Text('Week'),
                        icon: Icon(Icons.calendar_view_week),
                      ),
                      ButtonSegment<Calendar>(
                        value: Calendar.month,
                        label: Text('Month'),
                        icon: Icon(Icons.calendar_view_month),
                      ),
                      ButtonSegment<Calendar>(
                        value: Calendar.year,
                        label: Text('Year'),
                        icon: Icon(Icons.calendar_today),
                      ),
                    ],
                    selected: <Calendar>{calendarView},
                    onSelectionChanged: (Set<Calendar> newSelection) {
                      setState(() {
                        calendarView = newSelection.first;
                      });
                    },
                  ),
                  SizedBox(width: 10),
                ],
              ),
              SizedBox(height: 10),
              Text('Progress', style: TextStyle(fontSize: 10)),
              SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: Container(color: Colors.red, height: 10),
                    flex: 2,
                  ),
                  Expanded(
                    child: Container(color: Colors.green, height: 10),
                    flex: 1,
                  ),
                  Expanded(
                    child: Container(color: Colors.blue, height: 10),
                    flex: 2,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
