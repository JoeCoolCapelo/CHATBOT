from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from api.models import Student, Teacher

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'role', 'is_active', 'created_at')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, default='student')
    
    # Extra fields for student/teacher
    department = serializers.CharField(required=False, allow_blank=True)
    student_number = serializers.CharField(required=False, allow_blank=True)
    academic_year = serializers.CharField(required=False, allow_blank=True)
    specialty = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('email', 'password', 'first_name', 'last_name', 'role', 'department', 'student_number', 'academic_year', 'specialty')

    def create(self, validated_data):
        department = validated_data.pop('department', '')
        student_number = validated_data.pop('student_number', '')
        academic_year = validated_data.pop('academic_year', '')
        specialty = validated_data.pop('specialty', '')
        
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data['role'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )

        if user.role == 'student':
            Student.objects.create(
                user=user,
                department=department,
                student_number=student_number,
                academic_year=academic_year
            )
        elif user.role == 'teacher':
            Teacher.objects.create(
                user=user,
                department=department,
                specialty=specialty
            )
            
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        token['email'] = user.email
        return token
        
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data

class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)

    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Mot de passe actuel incorrect.')
        return value

from .models import Internship, Document

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ('internship', 'uploaded_at', 'file_size', 'file_name', 'file_url')

class InternshipSerializer(serializers.ModelSerializer):
    documents = DocumentSerializer(many=True, read_only=True)
    student_name = serializers.SerializerMethodField()
    teacher_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Internship
        fields = '__all__'
        read_only_fields = ('student', 'status', 'created_at')

    def get_student_name(self, obj):
        user = obj.student.user
        return f"{user.first_name} {user.last_name}".strip() or user.email

    def get_teacher_name(self, obj):
        if hasattr(obj.student, 'teacher') and obj.student.teacher:
            user = obj.student.teacher.user
            return f"{user.first_name} {user.last_name}".strip() or user.email
        return "Enseignant"

from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
