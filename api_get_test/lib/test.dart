import "package:flutter/material.dart";

class TestPage extends StatefulWidget {
  @override
  State<TestPage> createState() => _TestPage();
}

class _TestPage extends State<TestPage> {
  String _selectedThemeValue = "Light";
  String _SelectedColorValue = "default";
  String _cardSelectedColorValue = "inherit global";
  final List<String> _ThemeItems = ["Light", "Dark", "System"];
  final List<String> _ColorItems = [
    "red",
    "green",
    "yellow",
    "blue",
    "default",
  ];
  final List<String> _cardSelectedItems = [
    "red",
    "green",
    "yellow",
    "blue",
    "inherit global",
  ];
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            child: Expanded(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    child: Row(
                      children: [
                        Icon(Icons.abc_outlined),
                        Text(
                          "Multi - Theme - Demo",
                          style: Theme.of(context).textTheme.headlineLarge,
                        ),
                      ],
                    ),
                  ),
                  Container(
                    child: Row(
                      children: [
                        Container(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text("COLOR MODE"),
                              DropdownButton(
                                value: _selectedThemeValue,
                                items: _ThemeItems.map((String item) {
                                  return DropdownMenuItem<String>(
                                    value: item,
                                    child: Text(item),
                                  );
                                }).toList(),
                                onChanged: (String? newValue) {
                                  setState(() {
                                    _selectedThemeValue = newValue!;
                                  });
                                },
                              ),
                            ],
                          ),
                        ),
                        SizedBox(width: 20),
                        Container(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text("GLOBAL THEME"),
                              DropdownButton(
                                value: _SelectedColorValue,
                                items: _ColorItems.map((String item) {
                                  return DropdownMenuItem<String>(
                                    value: item,
                                    child: Text(item),
                                  );
                                }).toList(),
                                onChanged: (String? newValue) {
                                  setState(() {
                                    _SelectedColorValue = newValue!;
                                  });
                                },
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          Container(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                Container(
                  width: 250,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text("Section Theme"),
                          DropdownButton(
                            value: _cardSelectedColorValue,
                            items: _cardSelectedItems.map((String item) {
                              return DropdownMenuItem(
                                child: Text(item),
                                value: item,
                              );
                            }).toList(),
                            onChanged: (String? newValue) {
                              setState(() {
                                _cardSelectedColorValue = newValue!;
                              });
                            },
                          ),
                        ],
                      ),
                      SizedBox(height: 10),
                      Text("Header"),
                      SizedBox(height: 10),
                      Text(
                        "contentsaodhsakdhkasduhahkiusdhuasuihdhiuad,sadhfahsduaihusdhiahiudashiu",
                      ),
                      Container(
                        child: Padding(
                          padding: EdgeInsetsGeometry.all(16),
                          child: Column(
                            children: [
                              Text("context header"),
                              Container(
                                child: Row(
                                  children: [
                                    Icon(Icons.abc),
                                    Text("contentsaduhsaduih"),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  width: 250,
                  child: Column(
                    children: [
                      Row(
                        children: [
                          Text("Section Theme"),
                          DropdownButton(
                            value: _cardSelectedColorValue,
                            items: _cardSelectedItems.map((String item) {
                              return DropdownMenuItem(
                                child: Text(item),
                                value: item,
                              );
                            }).toList(),
                            onChanged: (String? newValue) {
                              setState(() {
                                _cardSelectedColorValue = newValue!;
                              });
                            },
                          ),
                        ],
                      ),
                      SizedBox(height: 10),
                      Text("Header"),
                      SizedBox(height: 10),
                      Text(
                        "contentsaodhsakdhkasduhahkiusdhuasuihdhiuad,sadhfahsduaihusdhiahiudashiu",
                      ),
                      Container(
                        child: Padding(
                          padding: EdgeInsetsGeometry.all(16),
                          child: Column(
                            children: [
                              TextField(
                                decoration: InputDecoration(
                                  labelText: "123",
                                  hintText: "1465",
                                  border: OutlineInputBorder(),
                                ),
                              ),
                              TextField(
                                decoration: InputDecoration(
                                  labelText: "123",
                                  hintText: "1465",
                                  border: OutlineInputBorder(),
                                ),
                              ),
                              TextField(
                                decoration: InputDecoration(
                                  labelText: "123",
                                  hintText: "1465",
                                  border: OutlineInputBorder(),
                                ),
                              ),
                              Row(
                                children: [
                                  Checkbox(
                                    value: true,
                                    onChanged: (bool? value) {
                                      setState(() {
                                        value = value ?? false;
                                      });
                                    },
                                  ),
                                  Text("data"),
                                ],
                              ),
                              Row(
                                children: [
                                  ElevatedButton(
                                    onPressed: () {},
                                    child: Text("12"),
                                  ),
                                  ElevatedButton(
                                    onPressed: () {},
                                    child: Text("123"),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  width: 250,
                  child: Column(
                    children: [
                      Row(
                        children: [
                          Text("Section Theme"),
                          DropdownButton(
                            value: _cardSelectedColorValue,
                            items: _cardSelectedItems.map((String item) {
                              return DropdownMenuItem(
                                child: Text(item),
                                value: item,
                              );
                            }).toList(),
                            onChanged: (String? newValue) {
                              setState(() {
                                _cardSelectedColorValue = newValue!;
                              });
                            },
                          ),
                        ],
                      ),
                      SizedBox(height: 10),
                      Text("Header"),
                      SizedBox(height: 10),
                      Text(
                        "contentsaodhsakdhkasduhahkiusdhuasuihdhiuad,sadhfahsduaihusdhiahiudashiu",
                      ),
                      Container(
                        child: Padding(
                          padding: EdgeInsetsGeometry.all(16),
                          child: Wrap(
                            spacing: 40,
                            runSpacing: 20,
                            children: [
                              Container(
                                width: 50,
                                height: 50,
                                child: Column(
                                  children: [
                                    Icon(Icons.abc),
                                    Text("contentsaduhsaduih"),
                                  ],
                                ),
                              ),

                              Container(
                                width: 50,
                                height: 50,
                                child: Column(
                                  children: [
                                    Icon(Icons.abc),
                                    Text("contentsaduhsaduih"),
                                  ],
                                ),
                              ),

                              Container(
                                width: 50,
                                height: 50,
                                child: Column(
                                  children: [
                                    Icon(Icons.abc),
                                    Text("contentsaduhsaduih"),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          SizedBox(height: 20),
          Container(),
        ],
      ),
    );
  }
}
