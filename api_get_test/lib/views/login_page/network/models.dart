class User {
  final int id;
  final String username;
  final String email;
  final String firstName;
  final String lastName;
  final String gender;
  final dynamic image;
  final String accessToken;
  final String refreshToken;

  User({
    required this.id,
    required this.email,
    required this.username,
    required this.lastName,
    required this.firstName,
    required this.gender,
    required this.image,
    required this.accessToken,
    required this.refreshToken,
  });

  factory User.fromJson(Map<String,dynamic> json){
    return User(
      id:json['id'],
      username:json['username'],
      email:json['email'],
      firstName:json['firstName'],
      lastName:json['lastName'],
      gender:json['gender'],
      image:json['iamge'],
      accessToken:json['accessToken'],
      refreshToken: json['refreshToken']
    );
  }
}