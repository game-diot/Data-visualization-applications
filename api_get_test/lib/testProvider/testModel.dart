import 'package:flutter/material.dart';

enum ProjectThemeMode {light,dark}

enum WidgetThemeMode {red ,green ,yellow}


class WidgetTheme {
  final Color primary;
  final Color background;
  final Color text;

  const WidgetTheme({
    required this.primary,
    required this.background,
    required this.text,
  });
   ColorScheme toColorScheme(Brightness brightness) {
    return ColorScheme(
      brightness: brightness,
      primary: primary,
      onPrimary: text,
      secondary: primary,
      onSecondary: text,
      surface: background,
      onSurface: text,
      error: Colors.red,
      onError: Colors.white,
    );
  }
}

class WidgetThemeGroup {
  final WidgetTheme light;
  final WidgetTheme dark;
  const WidgetThemeGroup({
    required this.light,
    required this.dark,
  });
}