from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, CustomTokenObtainPairSerializer, ChangePasswordSerializer

class RegisterView(generics.CreateAPIView):
    queryset = RegisterSerializer.Meta.model.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class LogoutView(generics.GenericAPIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        try:
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)

class ChangePasswordView(generics.GenericAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = ChangePasswordSerializer

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'detail': 'Mot de passe mis à jour avec succès.'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        from .serializers import UserSerializer
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        from .serializers import UserSerializer
        user = request.user
        allowed = ['first_name', 'last_name']
        for field in allowed:
            if field in request.data:
                setattr(user, field, request.data[field])
        user.save()
        return Response(UserSerializer(user).data)

from rest_framework import viewsets, parsers
from django.conf import settings
from django.core.files.storage import default_storage
from .models import Internship, Document, Student
from .serializers import InternshipSerializer, DocumentSerializer
from rest_framework.decorators import action

class InternshipViewSet(viewsets.ModelViewSet):
    serializer_class = InternshipSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return Internship.objects.filter(student__user=user)
        elif user.role == 'teacher':
            return Internship.objects.filter(student__teacher__user=user)
        elif user.role == 'admin':
            return Internship.objects.all()
        return Internship.objects.none()

    def perform_create(self, serializer):
        student = Student.objects.get(user=self.request.user)
        serializer.save(student=student)

    @action(detail=True, methods=['patch'])
    def status(self, request, pk=None):
        internship = self.get_object()
        user = request.user
        if user.role not in ['teacher', 'admin']:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        new_status = request.data.get('status')
        rejection_comment = request.data.get('rejection_comment', '')
        if new_status in dict(Internship.STATUS_CHOICES):
            internship.status = new_status
            if new_status == 'rejected' and rejection_comment:
                internship.rejection_comment = rejection_comment
            internship.save()

            from .models import Notification
            msg = f"Le statut de votre dossier ({internship.company_name}) est passé à : {new_status}."
            if new_status == 'rejected' and rejection_comment:
                msg += f" Motif : {rejection_comment}"
            Notification.objects.create(
                user=internship.student.user,
                type='status_update',
                title='Mise à jour du statut',
                message=msg,
                link=f'/internships/{internship.id}'
            )
            
            return Response(InternshipSerializer(internship).data)
        return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)

class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return Document.objects.filter(internship__student__user=user)
        return Document.objects.all()

    @action(detail=False, methods=['post'])
    def upload(self, request):
        file_obj = request.FILES.get('file')
        internship_id = request.data.get('internship_id')
        doc_type = request.data.get('type')
        
        if not file_obj or not internship_id or not doc_type:
            return Response({"error": "Missing data"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            internship = Internship.objects.get(id=internship_id)
        except Internship.DoesNotExist:
            return Response({"error": "Internship not found"}, status=status.HTTP_404_NOT_FOUND)
            
        if internship.student.user != request.user:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        file_name = default_storage.save(f"documents/{file_obj.name}", file_obj)
        # Build absolute URL explicitly using the server base URL
        scheme = request.scheme  # http or https
        host = request.get_host()  # 127.0.0.1:8001
        file_url = f"{scheme}://{host}{settings.MEDIA_URL}{file_name}"
        
        doc = Document.objects.create(
            internship=internship,
            type=doc_type,
            file_name=file_obj.name,
            file_size=file_obj.size,
            file_url=file_url
        )
        return Response(DocumentSerializer(doc).data, status=status.HTTP_201_CREATED)

import os
import json
import uuid
from django.http import StreamingHttpResponse
from rest_framework.views import APIView
from .models import ChatbotMessage

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")

class ChatbotMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        message_content = request.data.get('message')
        session_id_str = request.data.get('session_id')
        
        if not message_content:
            return Response({"error": "Message is required"}, status=400)
            
        session_id = uuid.UUID(session_id_str) if session_id_str else uuid.uuid4()

        ChatbotMessage.objects.create(
            user=user, session_id=session_id, role='user', content=message_content
        )

        context = f"CONTEXTE UTILISATEUR:\n- Email: {user.email}\n- Role: {user.role}\n"
        
        if user.role == 'student':
            from .models import Student, Internship
            student = Student.objects.filter(user=user).first()
            if student:
                context += f"- Departement: {student.department}\n"
                if student.teacher:
                    context += f"- Enseignant referent: {student.teacher.user.email}\n"
                
                internships = Internship.objects.filter(student=student).order_by('-created_at')
                if internships.exists():
                    context += "\n--- STAGES ---\n"
                    for it in internships:
                        context += f"• [{it.status.upper()}] {it.job_title} chez {it.company_name} (du {it.start_date} au {it.end_date})\n"
                        docs = it.documents.all()
                        if docs.exists():
                            context += f"  Documents: {', '.join([d.type for d in docs])}\n"
                else:
                    context += "- Aucun stage declare.\n"
                    
        elif user.role == 'teacher':
            from .models import Teacher, Student
            teacher = Teacher.objects.filter(user=user).first()
            if teacher:
                students = Student.objects.filter(teacher=teacher)
                context += f"\n--- VOS ETUDIANTS ({students.count()}) ---\n"
                for st in students:
                    active = st.internships.last()
                    if active:
                        context += f"• {st.user.email} : Stage '{active.job_title}' en statut {active.status.upper()}\n"
                    else:
                        context += f"• {st.user.email} : Aucun stage\n"

        GEMINI_API_KEY = "" # Temporarily disabled because of 429 Quota Exhausted
        
        # Try Gemini API if key is available
        if GEMINI_API_KEY:
            try:
                import google.generativeai as genai
                genai.configure(api_key=GEMINI_API_KEY)
                
                role_specific_directives = ""
                if user.role == 'teacher':
                    role_specific_directives = (
                        "6. Tu t'adresses à un Enseignant. Aide-le à gérer ses étudiants, à rédiger des motifs de refus ou à résumer l'état d'avancement des conventions.\n"
                        "7. Sois professionnel et pertinent dans tes suggestions de feedback pour les étudiants."
                    )
                else:
                    role_specific_directives = "6. Tu t'adresses à un Étudiant. Aide-le à comprendre l'état de son stage et ce qu'il doit faire."

                system_prompt = (
                    f"Tu es InternBot, l'assistant intelligent de la plateforme InternTrack AI.\n{context}\n"
                    "DIRECTIVES OBLIGATOIRES :\n"
                    "1. Sois EXTRÊMEMENT CONCIS et direct pour garantir une vitesse de réponse maximale.\n"
                    "2. Réponds en 1 à 3 phrases maximum.\n"
                    "3. Utilise les données du contexte ci-dessus pour personnaliser tes réponses.\n"
                    "4. NE POSE JAMAIS de questions à l'utilisateur (par exemple 'Où en es-tu ?', 'Comment puis-je t'aider ?'). Contente-toi de répondre directement à sa requête.\n"
                    "5. Ne propose pas d'aide supplémentaire à la fin de chaque phrase.\n"
                    f"{role_specific_directives}"
                )
                
                model = genai.GenerativeModel(
                    'gemini-flash-latest', 
                    system_instruction=system_prompt,
                    generation_config=genai.types.GenerationConfig(
                        max_output_tokens=150,
                        temperature=0.7,
                    )
                )
                
                # Retrieve history (excluding the current user message because we pass it directly to send_message)
                history_qs = ChatbotMessage.objects.filter(session_id=session_id).order_by('created_at')[:20]
                history_list = list(history_qs)
                
                gemini_history = []
                # Pop the current message so it's not in the history
                if len(history_list) > 0 and history_list[-1].role == 'user' and history_list[-1].content == message_content:
                    history_list.pop()
                    
                for msg in history_list:
                    role = 'model' if msg.role == 'assistant' else 'user'
                    gemini_history.append({'role': role, 'parts': [msg.content]})

                def event_stream():
                    try:
                        chat = model.start_chat(history=gemini_history)
                        response = chat.send_message(message_content, stream=True)
                        full_response = ""
                        for chunk in response:
                            if chunk.text:
                                full_response += chunk.text
                                yield f"data: {json.dumps({'text': chunk.text})}\n\n"
                        
                        ChatbotMessage.objects.create(
                            user=user, session_id=session_id, role='assistant', content=full_response
                        )
                        yield f"data: {json.dumps({'done': True, 'session_id': str(session_id)})}\n\n"
                    except Exception as e:
                        print("Gemini Stream Error:", e)
                        yield f"data: {json.dumps({'error': str(e)})}\n\n"

                response = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
                response['Cache-Control'] = 'no-cache'
                return response
            except ImportError:
                print("google-generativeai not installed")
                pass
            except Exception as e:
                print("Gemini Global Error:", e)
                pass

        # Fallback: smart local responses
        msg_lower = message_content.lower()
        
        active_internship = None
        if user.role == 'student':
            from .models import Student, Internship
            student = Student.objects.filter(user=user).first()
            if student:
                active_internship = Internship.objects.filter(student=student).order_by('-created_at').first()
                
        
        if active_internship:
            status_labels = {
                'draft': 'en brouillon',
                'submitted': 'soumis et en attente de validation',
                'validating': 'en cours de validation par votre enseignant',
                'validated': 'validé ✅',
                'rejected': 'rejeté. Veuillez corriger les informations et soumettre à nouveau',
            }
            internship_info = f"Votre stage chez **{active_internship.company_name}** en tant que **{active_internship.job_title}** est actuellement **{status_labels.get(active_internship.status, active_internship.status)}**."
        else:
            internship_info = "Vous n'avez pas encore de dossier de stage actif. Rendez-vous dans **Mes Stages** pour en créer un."

        if any(w in msg_lower for w in ['bonjour', 'salut', 'hello', 'hi', 'hey', 'coucou']):
            reply = f"Bonjour ! 👋 Je suis **InternBot**, votre assistant InternTrack AI. Comment puis-je vous aider aujourd'hui ?\n\n{internship_info}"
        elif any(w in msg_lower for w in ['statut', 'status', 'état', 'etat', 'dossier', 'stage']):
            reply = f"📋 Voici l'état de votre dossier :\n\n{internship_info}\n\nVous pouvez consulter les détails depuis votre **Tableau de bord**."
        elif any(w in msg_lower for w in ['document', 'fichier', 'pdf', 'upload', 'convention']):
            reply = "📄 Pour gérer vos documents :\n\n1. Rendez-vous dans **Documents** depuis le menu latéral\n2. Vous pouvez y consulter, télécharger ou ajouter des fichiers\n3. Les formats acceptés sont **PDF** uniquement\n\nLors de la soumission d'un dossier, vous pouvez joindre votre convention de stage."
        elif any(w in msg_lower for w in ['aide', 'help', 'comment', 'quoi', 'fonctionn']):
            reply = "🤖 Voici ce que je peux faire pour vous :\n\n• **Statut du dossier** — Demandez-moi l'état de votre stage\n• **Documents** — Je vous guide pour gérer vos fichiers\n• **Procédures** — Je vous explique les étapes à suivre\n• **Questions générales** — Je réponds à vos questions sur InternTrack\n\nEssayez par exemple : *\"Quel est le statut de mon stage ?\"*"
        elif any(w in msg_lower for w in ['merci', 'thanks', 'top', 'parfait', 'super', 'genial', 'génial']):
            reply = "De rien ! 😊 N'hésitez pas si vous avez d'autres questions. Je suis là pour vous aider !"
        elif any(w in msg_lower for w in ['valider', 'validation', 'enseignant', 'professeur', 'prof']):
            reply = "👨‍🏫 La validation fonctionne ainsi :\n\n1. Vous **soumettez** votre dossier de stage\n2. Votre enseignant référent reçoit une **notification**\n3. Il peut **valider** ou **rejeter** votre dossier avec un commentaire\n4. Vous recevez une notification du résultat\n\nLe processus prend généralement **quelques jours**."
        elif any(w in msg_lower for w in ['créer', 'creer', 'nouveau', 'soumettre', 'déclarer', 'declarer']):
            reply = "📝 Pour déclarer un nouveau stage :\n\n1. Allez dans **Mes Stages** depuis le menu\n2. Cliquez sur **Créer un dossier**\n3. Remplissez les **4 étapes** du formulaire (entreprise, dates, missions, documents)\n4. Cliquez sur **Soumettre**\n\nVotre dossier sera envoyé à votre enseignant pour validation."
        else:
            reply = f"Je comprends votre question. Voici un résumé de votre situation :\n\n{internship_info}\n\nPour plus d'aide, vous pouvez me demander :\n• Le **statut** de votre dossier\n• Comment **soumettre** un stage\n• Comment gérer vos **documents**\n• Le processus de **validation**"

        ChatbotMessage.objects.create(
            user=user, session_id=session_id, role='assistant', content=reply
        )

        def fallback_stream():
            # Stream word by word for a natural feel
            words = reply.split(' ')
            for i, word in enumerate(words):
                chunk = word + (' ' if i < len(words) - 1 else '')
                yield f"data: {json.dumps({'text': chunk})}\n\n"
            yield f"data: {json.dumps({'done': True, 'session_id': str(session_id)})}\n\n"

        response = StreamingHttpResponse(fallback_stream(), content_type='text/event-stream')
        response['Cache-Control'] = 'no-cache'
        return response

from .models import Notification, User
from .serializers import NotificationSerializer, UserSerializer

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        self.get_queryset().update(is_read=True)
        return Response({"status": "success"})

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role != 'admin':
            return User.objects.none()
        return User.objects.all().order_by('-created_at')

class ChatbotSessionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from django.db.models import Min
        user = request.user
        sessions_query = ChatbotMessage.objects.filter(user=user).values('session_id').annotate(
            started_at=Min('created_at')
        ).order_by('-started_at')
        
        sessions = []
        for sq in sessions_query:
            session_id = sq['session_id']
            first_msg = ChatbotMessage.objects.filter(
                user=user, session_id=session_id, role='user'
            ).order_by('created_at').first()
            
            title = first_msg.content[:50] + '...' if first_msg and len(first_msg.content) > 50 else (first_msg.content if first_msg else 'Nouvelle conversation')
            
            sessions.append({
                'id': str(session_id),
                'title': title,
                'started_at': sq['started_at']
            })
            
        return Response(sessions)

class ChatbotSessionMessageListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, session_id):
        user = request.user
        messages = ChatbotMessage.objects.filter(user=user, session_id=session_id).order_by('created_at')
        data = [
            {
                'id': str(msg.id),
                'role': msg.role,
                'content': msg.content,
                'created_at': msg.created_at
            } for msg in messages
        ]
        return Response(data)

    def delete(self, request, session_id):
        user = request.user
        deleted_count, _ = ChatbotMessage.objects.filter(user=user, session_id=session_id).delete()
        return Response({'deleted': deleted_count}, status=204)


class InternshipMessageView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, internship_id):
        from .models import InternshipMessage, Internship
        # Check the user is allowed to see messages for this internship
        try:
            internship = Internship.objects.get(id=internship_id)
        except Internship.DoesNotExist:
            return Response({'error': 'Dossier introuvable.'}, status=404)

        user = request.user
        allowed = (
            user.role in ('admin', 'teacher') or
            (user.role == 'student' and hasattr(user, 'student_profile') and internship.student == user.student_profile)
        )
        if not allowed:
            return Response({'error': 'Non autorisé.'}, status=403)

        msgs = InternshipMessage.objects.filter(internship=internship).order_by('created_at')
        data = [
            {
                'id': str(m.id),
                'sender_id': str(m.sender.id),
                'sender_name': f"{m.sender.first_name} {m.sender.last_name}".strip() or m.sender.email,
                'sender_role': m.sender.role,
                'content': m.content,
                'created_at': m.created_at.isoformat(),
            }
            for m in msgs
        ]
        return Response(data)

    def post(self, request, internship_id):
        from .models import InternshipMessage, Internship, Notification
        try:
            internship = Internship.objects.get(id=internship_id)
        except Internship.DoesNotExist:
            return Response({'error': 'Dossier introuvable.'}, status=404)

        user = request.user
        allowed = (
            user.role in ('admin', 'teacher') or
            (user.role == 'student' and hasattr(user, 'student_profile') and internship.student == user.student_profile)
        )
        if not allowed:
            return Response({'error': 'Non autorisé.'}, status=403)

        content = request.data.get('content', '').strip()
        if not content:
            return Response({'error': 'Message vide.'}, status=400)

        msg = InternshipMessage.objects.create(internship=internship, sender=user, content=content)

        # --- Send notification to the other party ---
        sender_name = f"{user.first_name} {user.last_name}".strip() or user.email
        short_content = content if len(content) <= 80 else content[:80] + '…'

        if user.role in ('teacher', 'admin'):
            # Notify the student
            Notification.objects.create(
                user=internship.student.user,
                type='new_message',
                title=f'Message de {sender_name}',
                message=f'Votre enseignant a laissé une remarque sur votre dossier ({internship.company_name}) : « {short_content} »',
                link=f'/messages?dossier={internship.id}'
            )
        elif user.role == 'student':
            # Notify the teacher
            teacher = internship.student.teacher
            if teacher:
                Notification.objects.create(
                    user=teacher.user,
                    type='new_message',
                    title=f'Réponse de {sender_name}',
                    message=f'L\'étudiant a répondu sur le dossier ({internship.company_name}) : « {short_content} »',
                    link=f'/messages?dossier={internship.id}'
                )

        return Response({
            'id': str(msg.id),
            'sender_id': str(user.id),
            'sender_name': sender_name,
            'sender_role': user.role,
            'content': msg.content,
            'created_at': msg.created_at.isoformat(),
        }, status=201)
