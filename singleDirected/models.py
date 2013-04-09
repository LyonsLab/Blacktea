from django.db import models

class User(models.Model):
    user_id = models.AutoField(primary_key=True)
    user_name = models.CharField(max_length=50)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.CharField(max_length=50)
    description = models.CharField(max_length=255)
    date = models.DateTimeField()
    admin = models.BooleanField()

    # Connect to the user table of the database
    class Meta:
        db_table = 'user'

    def __json__(self):
        json = {"name" : self.user_name,
                "user_id" : self.user_id,
                "type" : "User",
                "size" : Log.objects.filter(user=self.user_id).count(),
                "children" : []
               }
        return json

class Log(models.Model):
    log_id = models.AutoField(primary_key=True)
    time = models.DateTimeField()
    user = models.ForeignKey(User)
    page = models.CharField(max_length=255)
    description = models.CharField(max_length=255)
    link = models.CharField(max_length=255)
    status = models.BooleanField()
    comment = models.CharField(max_length=255)

    # Connect to the log table of the database
    class Meta:
        db_table = 'log'
