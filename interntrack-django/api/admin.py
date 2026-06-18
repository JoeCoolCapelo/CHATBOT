from django.contrib import admin
from .models import User, Student, Teacher, Internship, Document, Validation, ChatbotMessage, Notification

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'role', 'is_active', 'is_staff', 'created_at')
    list_filter = ('role', 'is_active', 'is_staff')
    search_fields = ('email',)

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('user', 'student_number', 'department', 'academic_year', 'teacher')
    list_filter = ('department', 'academic_year')
    search_fields = ('student_number', 'user__email')

@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ('user', 'department', 'specialty')
    list_filter = ('department',)
    search_fields = ('user__email', 'specialty')

@admin.register(Internship)
class InternshipAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'job_title', 'student', 'status', 'start_date', 'end_date')
    list_filter = ('status',)
    search_fields = ('company_name', 'job_title', 'student__user__email')

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('file_name', 'type', 'internship', 'file_size', 'uploaded_at')
    list_filter = ('type',)
    search_fields = ('file_name', 'internship__company_name')

@admin.register(Validation)
class ValidationAdmin(admin.ModelAdmin):
    list_display = ('internship', 'teacher', 'decision', 'validated_at')
    list_filter = ('decision',)

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'type', 'is_read', 'created_at')
    list_filter = ('is_read', 'type')
    search_fields = ('title', 'user__email')

@admin.register(ChatbotMessage)
class ChatbotMessageAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'created_at')
    list_filter = ('role',)
