import os
import sys
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hardtrust.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from apps.accounts.models import User, SellerProfile
from apps.listings.models import Listing, Category, PhysicalCondition
from decimal import Decimal

def ensure_category(name, icon=None):
    cat, _ = Category.objects.get_or_create(name=name, defaults={'icon': icon or name[:2]})
    return cat

def ensure_condition(name):
    cond, _ = PhysicalCondition.get_or_create(name=name)
    return cond

def user_for(username, email, reputation):
    user, created = User.objects.get_or_create(username=username, defaults={'email': email})
    if created:
        user.set_password('demo1234')
        user.save()
    profile, _ = SellerProfile.objects.get_or_create(user=user, defaults={'reputation': Decimal(str(reputation))})
    return user

def main():
    cpu = ensure_category('CPU')
    gpu = ensure_category('GPU')
    ram = ensure_category('RAM')
    ssd = ensure_category('SSD')
    hdd = ensure_category('HDD')
    psu = ensure_category('PSU')

    used = PhysicalCondition.get_or_create('Usado')
    new = PhysicalCondition.get_or_create('Nuevo')
    ref = PhysicalCondition.get_or_create('Reacondicionado')

    seller_a = user_for('seller_demo_a', 'a@demo.local', 4.8)
    seller_b = user_for('seller_demo_b', 'b@demo.local', 4.5)
    seller_c = user_for('seller_demo_c', 'c@demo.local', 4.9)

    samples = [
        dict(seller=seller_a, category=cpu, condition=used, hardware_type='CPU', title='Intel Core i5-10400F', description='Socket: LGA1200. 6 nucleos, 12 hilos. Ideal gaming gama media.', brand='Intel', model='i5-10400F', price=Decimal('95000'), images=[], status='ACTIVE', risk_level='Bajo', ml_summary='Listo para publicar'),
        dict(seller=seller_a, category=cpu, condition=ref, hardware_type='CPU', title='AMD Ryzen 5 5600', description='Socket: AM4. 6 nucleos / 12 hilos. Refrigeracion stock.', brand='AMD', model='Ryzen 5 5600', price=Decimal('112000'), images=[], status='ACTIVE', risk_level='Bajo', ml_summary='Listo'),
        dict(seller=seller_b, category=gpu, condition=used, hardware_type='GPU', title='NVIDIA RTX 3070 Ti', description='VRAM: 8 GB. Marca: NVIDIA. Mining no detectado.', brand='NVIDIA', model='RTX 3070 Ti', price=Decimal('320000'), images=[], status='PENDING', risk_level='Medio', ml_summary='Revision media'),
        dict(seller=seller_c, category=gpu, condition=new, hardware_type='GPU', title='AMD Radeon RX 7600', description='VRAM: 8 GB. Marca: AMD. Gama media 1080p.', brand='AMD', model='RX 7600', price=Decimal('289000'), images=[], status='ACTIVE', risk_level='Bajo', ml_summary='Buen precio'),
        dict(seller=seller_a, category=gpu, condition=ref, hardware_type='GPU', title='Intel Arc A770', description='VRAM: 16 GB. Marca: Intel. Recomendado AV1.', brand='Intel', model='Arc A770', price=Decimal('210000'), images=[], status='ACTIVE', risk_level='Bajo', ml_summary='Aceptable'),
        dict(seller=seller_b, category=ram, condition=used, hardware_type='RAM', title='Corsair Vengeance 16GB DDR4', description='Tipo: DIMM. DDR4. 16 GB. 3200 MHz CL16.', brand='Corsair', model='Vengeance 16GB', price=Decimal('42000'), images=[], status='ACTIVE', risk_level='Bajo', ml_summary='Buen estado'),
        dict(seller=seller_c, category=ram, condition=new, hardware_type='RAM', title='Kingston FURY Beast 32GB DDR5', description='Tipo: DIMM. DDR5. 32 GB. 6000 MHz.', brand='Kingston', model='FURY Beast 32GB', price=Decimal('78000'), images=[], status='PENDING', risk_level='Bajo', ml_summary='Listo'),
        dict(seller=seller_a, category=ssd, condition=used, hardware_type='SSD', title='Samsung 980 PRO 1TB', description='NVMe PCIe 4.0. 1 TB. Salud buen estado.', brand='Samsung', model='980 PRO 1TB', price=Decimal('64000'), images=[], status='ACTIVE', risk_level='Bajo', ml_summary='Aceptable'),
        dict(seller=seller_b, category=ssd, condition=new, hardware_type='SSD', title='WD Black SN850X 2TB', description='NVMe PCIe 4.0. 2 TB.', brand='Western Digital', model='SN850X 2TB', price=Decimal('98000'), images=[], status='ACTIVE', risk_level='Bajo', ml_summary='Nuevo sellado'),
        dict(seller=seller_c, category=psu, condition=new, hardware_type='PSU', title='Corsair RM850x 850W', description='80 Plus Gold. Full modular.', brand='Corsair', model='RM850x', price=Decimal('105000'), images=[], status='ACTIVE', risk_level='Bajo', ml_summary='Buen registro'),
        dict(seller=seller_a, category=psu, condition=used, hardware_type='PSU', title='EVGA 750W 80+ Bronze', description='Semi modular. Stock clarity.', brand='EVGA', model='750W Bronze', price=Decimal('48000'), images=[], status='ACTIVE', risk_level='Bajo', ml_summary='Revisado'),
        dict(seller=seller_b, category=hdd, condition=used, hardware_type='HDD', title='Seagate Barracuda 2TB', description='3.5 pulgadas. 7200 rpm. Estado usado.', brand='Seagate', model='Barracuda 2TB', price=Decimal('28000'), images=[], status='ACTIVE', risk_level='Bajo', ml_summary='Normal'),
    ]

    for item in samples:
        obj = Listing.objects.create(**item)
        print('CREATED', obj.id, obj.title)

    print('TOTAL_LISTINGS:', Listing.objects.count())

if __name__ == '__main__':
    main()
