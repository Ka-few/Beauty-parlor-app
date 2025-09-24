from flask_sqlalchemy import SQLAlchemy
from sqlalchemy_serializer import SerializerMixin

db = SQLAlchemy()

# Association table for many-to-many relationship between Stylists and Services
stylist_service = db.Table(
    "stylist_service",
    db.Column("stylist_id", db.Integer, db.ForeignKey("stylist.id"), primary_key=True),
    db.Column("service_id", db.Integer, db.ForeignKey("service.id"), primary_key=True)
)

# ----------------- CUSTOMER -----------------
class Customer(db.Model, SerializerMixin):
    __tablename__ = "customer"
    serialize_rules = ("-bookings.customer", "-bookings.stylist", "-bookings.service")

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)

    bookings = db.relationship(
        "Booking",
        back_populates="customer",
        cascade="all, delete-orphan"
    )

# ----------------- SERVICE -----------------
class Service(db.Model, SerializerMixin):
    __tablename__ = "service"
    serialize_rules = ("-stylists.services", "-bookings.service", "-bookings.customer", "-bookings.stylist")

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    price = db.Column(db.Float, nullable=False)

# ----------------- STYLIST -----------------
class Stylist(db.Model, SerializerMixin):
    __tablename__ = "stylist"
    serialize_rules = ("-services.stylists", "-bookings.stylist", "-bookings.customer", "-bookings.service")

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    bio = db.Column(db.String(255), nullable=True)

    services = db.relationship(
        "Service",
        secondary=stylist_service,
        backref=db.backref("stylists", lazy="joined")
    )

    bookings = db.relationship(
        "Booking",
        back_populates="stylist",
        cascade="all, delete-orphan"
    )

# ----------------- BOOKING -----------------
class Booking(db.Model, SerializerMixin):
    __tablename__ = "booking"
    serialize_rules = ("-customer.bookings", "-stylist.bookings", "-service.bookings")

    id = db.Column(db.Integer, primary_key=True)
    appointment_time = db.Column(db.DateTime, nullable=False)

    customer_id = db.Column(db.Integer, db.ForeignKey("customer.id"), nullable=False)
    customer = db.relationship("Customer", back_populates="bookings")

    stylist_id = db.Column(db.Integer, db.ForeignKey("stylist.id"), nullable=False)
    stylist = db.relationship("Stylist", back_populates="bookings")

    service_id = db.Column(db.Integer, db.ForeignKey("service.id"), nullable=False)
    service = db.relationship("Service", backref="bookings")
