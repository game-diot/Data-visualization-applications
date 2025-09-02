import 'package:api_get_test/views/favorites_page/widgets/ListNotEmpty.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/word_generator_state.dart';
import 'widgets/ListEmpty.dart';
// favorite page部分
class favorites_page extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    var wordState = context.watch<WordGeneratorState>();

    if (wordState.favorites.isEmpty) {
      return ListEmpty();
    } else {
      return ListNotEmpty();
    }
  }
}
