class UserDetail {
  final int id;
  final String username;
  final String firstName;
  final String lastName;
  final String email;
  final String gender;
  final String image;
  final String role;

  // 这里可以先只挑关键字段，不需要把所有 address/bank/company 都加上
  UserDetail({
    required this.id,
    required this.username,
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.gender,
    required this.image,
    required this.role,
  });

  factory UserDetail.fromJson(Map<String, dynamic> json) {
    return UserDetail(
      id: json['id'],
      username: json['username'],
      firstName: json['firstName'],
      lastName: json['lastName'],
      email: json['email'],
      gender: json['gender'],
      image: json['image'] ?? '',
      role: json['role'] ?? 'user',
    );
  }
}
