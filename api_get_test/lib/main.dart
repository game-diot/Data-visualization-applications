import 'package:api_get_test/networks/Auth/provides/GetUserProvider.dart';
import 'package:api_get_test/networks/Auth/provides/LoginProvider.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'app.dart';
import 'providers/word_generator_state.dart';
import 'providers/network_data_state.dart';
import 'providers/api_service_state.dart';
import 'testProvider/testProvider.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => WordGeneratorState()),
        ChangeNotifierProvider(create: (_) => ApiService()),
        ChangeNotifierProvider(create: (_) => NetworkDataState()),
        ChangeNotifierProvider(create: (_) => WidgetThemeProvider()),
        ChangeNotifierProvider(create: (_) => ProjectThemeProvider()),
        ChangeNotifierProvider(create: (_)=> LoginProvider()),
        ChangeNotifierProvider(create: (_)=>GetUserProvider()),
      ],
      child: const MyApp(),
    ),
  );
}
