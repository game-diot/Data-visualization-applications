import 'package:flutter/material.dart';
import 'testModel.dart';

class ProjectThemeProvider with ChangeNotifier {
  ProjectThemeMode _mode = ProjectThemeMode.light;
  ProjectThemeMode get mode => _mode;
  bool get isDark => _mode == ProjectThemeMode.dark;

  void toggleTheme() {
    _mode = _mode == ProjectThemeMode.light
        ? ProjectThemeMode.dark
        : ProjectThemeMode.light;
  }

  void setThemeMode(ProjectThemeMode mode) {
    if (_mode != mode) {
      _mode = mode;
      notifyListeners();
    }
  }
}

class WidgetThemeProvider with ChangeNotifier {
  WidgetThemeMode _currentType = WidgetThemeMode.red;

  WidgetThemeMode get currentType => _currentType;

  void setWidgetTheme(WidgetThemeMode type){
    _currentType = type;
    notifyListeners();
  }

  static final Map<WidgetThemeMode, WidgetThemeGroup> _themes = {
    WidgetThemeMode.red: WidgetThemeGroup(
      light: WidgetTheme(primary: Colors.red, background: Colors.white, text: Colors.black),
      dark: WidgetTheme(primary: Colors.red.shade200, background: Colors.black, text: Colors.white),
    ),
    WidgetThemeMode.green: WidgetThemeGroup(
      light: WidgetTheme(primary: Colors.green, background: Colors.white, text: Colors.black),
      dark: WidgetTheme(primary: Colors.green.shade200, background: Colors.black, text: Colors.white),
    ),
    WidgetThemeMode.yellow: WidgetThemeGroup(
      light: WidgetTheme(primary: Colors.yellow, background: Colors.white, text: Colors.black),
      dark: WidgetTheme(primary: Colors.yellow.shade200, background: Colors.black, text: Colors.white),
    ),
  };
  WidgetTheme getCurrentTheme(ProjectThemeMode mode){
    final group = _themes[_currentType]!;
    return mode == ProjectThemeMode.dark?group.dark:group.light;
  }
}