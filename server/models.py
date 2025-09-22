
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy_serializer import SerializerMixin
from flask_bcrypt import Bcrypt
from datetime import datetime

db = SQLAlchemy()

class Customer(db.Model, SerializerMixin):
    __tablename__ = "customers"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    phone = db.Column(db.String)
    password_hash = db.Column(db.String, nullable=False)

    bookings = db.relationship("Booking", back_populates="customer")

    # Prevent recursion: don't include bookings → customer → bookings loop
    serialize_rules = ("-bookings.customer",)
    
    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)


class Stylist(db.Model, SerializerMixin):
    __tablename__ = "stylists"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    bio = db.Column(db.Text)

    services = db.relationship("StylistService", back_populates="stylist")
    bookings = db.relationship("Booking", back_populates="stylist")

    serialize_rules = ("-services.stylist", "-bookings.stylist")


class Service(db.Model, SerializerMixin):
    __tablename__ = "services"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String)
    description = db.Column(db.Text)
    base_price = db.Column(db.Float)

    stylists = db.relationship("StylistService", back_populates="service")
    bookings = db.relationship("Booking", back_populates="service")

    serialize_rules = ("-stylists.service", "-bookings.service")


class StylistService(db.Model, SerializerMixin):
    __tablename__ = "stylist_services"

    stylist_id = db.Column(db.Integer, db.ForeignKey("stylists.id"), primary_key=True)
    service_id = db.Column(db.Integer, db.ForeignKey("services.id"), primary_key=True)

    stylist = db.relationship("Stylist", back_populates="services")
    service = db.relationship("Service", back_populates="stylists")

    serialize_rules = ("-stylist.services", "-service.stylists")


class Booking(db.Model, SerializerMixin):
    __tablename__ = "bookings"

    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey("customers.id"))
    service_id = db.Column(db.Integer, db.ForeignKey("services.id"))
    stylist_id = db.Column(db.Integer, db.ForeignKey("stylists.id"))
    preferred_date = db.Column(db.DateTime)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    customer = db.relationship("Customer", back_populates="bookings")
    service = db.relationship("Service", back_populates="bookings")
    stylist = db.relationship("Stylist", back_populates="bookings")

    # Only include certain fields in serialization
    serialize_only = ("id", "preferred_date", "notes", "created_at",
                      "customer.id", "customer.name",
                      "service.id", "service.title", "service.base_price",
                      "stylist.id", "stylist.name")