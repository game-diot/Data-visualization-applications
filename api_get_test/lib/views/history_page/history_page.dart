import 'package:api_get_test/views/history_page/widgets/ListIsNotEmpty.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/word_generator_state.dart';
import 'widgets/ListIsEmpty.dart';

class history_page extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    var wordState = context.watch<WordGeneratorState>();

    if (wordState.history.isEmpty) {
      return ListIsEmpty();
    }

    return ListIsNotEmpty();
  }
}