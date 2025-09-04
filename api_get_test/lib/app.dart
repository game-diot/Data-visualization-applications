import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'views/my_home_page/my_home_page.dart';
import 'testProvider/testProvider.dart';

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    // 这里可以安全访问 Provider
    final projectTheme = context.watch<ProjectThemeProvider>();
    final widgetThemeProvider = context.watch<WidgetThemeProvider>();
    final widgetTheme = widgetThemeProvider.getCurrentTheme(projectTheme.mode);

    return MaterialApp(
      title: 'demo',
      theme: ThemeData(
        colorScheme: widgetTheme.toColorScheme(Brightness.light),
      ),
      home: my_home_page(),
    );
  }
}
