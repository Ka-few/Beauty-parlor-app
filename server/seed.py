"""Idempotent default data seed. Run migrations before executing this script."""

from datetime import datetime, timedelta

from app import app, bcrypt, db
from models import Booking, Customer, Service, Stylist


def get_or_create(model, defaults=None, **lookup):
    instance = model.query.filter_by(**lookup).first()
    if instance is None:
        instance = model(**lookup, **(defaults or {}))
        db.session.add(instance)
    return instance


def seed_database():
    """Insert the original defaults without deleting or duplicating existing data."""
    # Do not call create_all/drop_all here. Schema changes must go through Flask-Migrate.
    get_or_create(
        Customer,
        phone="0700123456",
        defaults={
            "name": "admin",
            "password_hash": bcrypt.generate_password_hash("admin123").decode(),
            "is_admin": True,
        },
    )
    customer1 = get_or_create(
        Customer, phone="0765235645",
        defaults={"name": "Alice Johnson", "password_hash": "hashedpassword1", "is_admin": False},
    )
    customer2 = get_or_create(
        Customer, phone="0789098790",
        defaults={"name": "Bob Smith", "password_hash": "hashedpassword2", "is_admin": False},
    )

    service1 = get_or_create(Service, title="Haircut", defaults={"description": "Basic haircut service", "price": 30})
    service2 = get_or_create(Service, title="Hair Coloring", defaults={"description": "Professional hair coloring", "price": 50})
    service3 = get_or_create(Service, title="Manicure", defaults={"description": "Complete manicure service", "price": 25})

    stylist1 = get_or_create(Stylist, name="Sophie Lee", defaults={"bio": "Expert in haircuts and styling"})
    stylist2 = get_or_create(Stylist, name="David Kim", defaults={"bio": "Specialist in nail care and hair coloring"})
    stylist1.services = [service1, service2]
    stylist2.services = [service2, service3]
    db.session.flush()

    # The generated date changes every run, so use each original relationship triple as the seed key.
    if not Booking.query.filter_by(customer_id=customer1.id, stylist_id=stylist1.id, service_id=service1.id).first():
        db.session.add(Booking(appointment_time=datetime.now() + timedelta(days=1, hours=10), customer=customer1, stylist=stylist1, service=service1))
    if not Booking.query.filter_by(customer_id=customer2.id, stylist_id=stylist2.id, service_id=service3.id).first():
        db.session.add(Booking(appointment_time=datetime.now() + timedelta(days=2, hours=14), customer=customer2, stylist=stylist2, service=service3))

    db.session.commit()
    print("Database seeded successfully (existing records were preserved).")
    print("Default admin: phone=0700123456 password=admin123")


if __name__ == "__main__":
    with app.app_context():
        try:
            seed_database()
        except Exception:
            db.session.rollback()
            raise
