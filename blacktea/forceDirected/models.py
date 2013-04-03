from django.db import models

# Create your models here.
class User(models.Model):
    user_id = models.AutoField(primary_key=True)
    user_name = models.CharField(max_length=50)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.CharField(max_length=50)
    description = models.CharField(max_length=255)
    date = models.DateTimeField()
    admin = models.BooleanField()

    class Meta:
        db_table = 'user'
