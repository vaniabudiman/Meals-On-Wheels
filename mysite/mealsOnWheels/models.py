import datetime
from django.db import models
from django.utils import timezone

## The above will deleted later

## Definitions for Food Truck-related classes

class Position(models.Model):
    lat = models.FloatField()
    lon = models.FloatField()

    def __str__(self):
        return "(" + str(self.lat) + "," + str(self.lon) + ")"

class FoodTruck(models.Model):
    key = models.CharField('Key',max_length=50)
    key.primary_key = True
    name = models.CharField('Truck Name', max_length=200)
    foodType = models.CharField('Truck Food Type', max_length=200)
    position = models.ForeignKey(Position)

    def __str__(self):
        return "Truck " + self.key + ": " + self.name

class LastImportDate(models.Model):
    date = models.DateTimeField()
    date.null = True

## Needed for authentification
from django.contrib.auth.models import User
class UserProfile(models.Model):
    user = models.OneToOneField(User)
    activation_key = models.CharField(max_length=40,blank=True)
    key_expires = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.user.username

    class Meta:
        verbose_name_plural = 'User profiles'

## http://stackoverflow.com/questions/849142/how-to-limit-the-maximum-value-of-a-numeric-field-in-a-django-model
class Integer010Field(models.IntegerField):
    def __init__(self, verbose_name=None, name=None, **kwargs):
        self.min_value = 0
        self.max_value = 10
        models.IntegerField.__init__(self, verbose_name, name, **kwargs)

    def formfield(self, **kwargs):
        defaults = {'min_value': self.min_value, 'max_value':self.max_value}
        defaults.update(kwargs)
        return super(IntegerRangeField, self).formfield(**defaults)

class Review(models.Model):
    user = models.ForeignKey(User) ## a user has many reviews
    foodtruck = models.ForeignKey(FoodTruck) ## a food truck has many reviews
    rate = Integer010Field(
        blank=True,
        help_text="rate must be between 0 - 10")
    pub_date = models.DateField()
