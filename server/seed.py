from datetime import datetime, timedelta
from app import app, db
from models import Customer, Stylist, Service, Booking

with app.app_context():
    # Clear existing data
    Booking.query.delete()
    Customer.query.delete()
    Stylist.query.delete()
    Service.query.delete()
    db.session.commit()

    # --- Customers ---
    customer1 = Customer(name="Alice Johnson", phone="0765235645", password_hash="hashedpassword1")
    customer2 = Customer(name="Bob Smith", phone="0789098790", password_hash="hashedpassword2")
    db.session.add_all([customer1, customer2])
    db.session.commit()

    # --- Services ---
    service1 = Service(title="Haircut", description="Basic haircut service", price=30)
    service2 = Service(title="Hair Coloring", description="Professional hair coloring", price=50)
    service3 = Service(title="Manicure", description="Complete manicure service", price=25)
    db.session.add_all([service1, service2, service3])
    db.session.commit()

    # --- Stylists ---
    stylist1 = Stylist(name="Sophie Lee", bio="Expert in haircuts and styling", services=[service1, service2])
    stylist2 = Stylist(name="David Kim", bio="Specialist in nail care and hair coloring", services=[service2, service3])
    db.session.add_all([stylist1, stylist2])
    db.session.commit()

    # --- Bookings ---
    booking1 = Booking(
        appointment_time=datetime.now() + timedelta(days=1, hours=10),
        customer=customer1,
        stylist=stylist1,
        service=service1
    )
    booking2 = Booking(
        appointment_time=datetime.now() + timedelta(days=2, hours=14),
        customer=customer2,
        stylist=stylist2,
        service=service3
    )
    db.session.add_all([booking1, booking2])
    db.session.commit()

    print("Database seeded successfully!")
