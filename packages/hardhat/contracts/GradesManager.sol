// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;
contract GradesManager {
address public teacher; //владелец/преподаватель
mapping(address => uint8) private grades; // оценки 0..100 (или 2..5)
event GradeSet(address indexed teacher, address indexed student, uint256 grade);
modifier onlyTeacher() {
require(msg.sender == teacher, "Only teacher");
_;
}
constructor() {
teacher = msg.sender; // деплойер -- преподаватель
}
// READ: получить свою оценку
function getMyGrade() external view returns (uint8) {
return grades[msg.sender];
}
// READ: получить оценку любого студента (для UI преподавателя)
function getGrade(address student) external view
returns (uint8) {
return grades[student];
}
// WRITE: выставить/обновить оценку студенту (только преподаватель)
function setGrade(address student, uint8 grade)
external onlyTeacher {
require(student != address(0), "Bad student");
require(grade <= 100, "Grade out of range");
grades[student] = grade;
emit GradeSet(msg.sender, student, grade);
}
}
