from app.model.course_material import CourseMaterial
from app.model.material_files import MaterialFiles

from seeds.common import SEED_COUNT

SEED_FILE_PREFIX = "Seed File"


def _load_seeded_materials(db):
    return (
        db.query(CourseMaterial)
        .filter(CourseMaterial.name.like("Seed Material%"))
        .order_by(CourseMaterial.name)
        .limit(SEED_COUNT)
        .all()
    )


def _load_seeded_files(db):
    return (
        db.query(MaterialFiles)
        .filter(MaterialFiles.file_name.like(f"{SEED_FILE_PREFIX}%"))
        .order_by(MaterialFiles.file_name)
        .limit(SEED_COUNT)
        .all()
    )


def seed_material_files(db, material_ids=None):
    """Seed 25 material files (one per seeded course material)."""
    existing = _load_seeded_files(db)
    if len(existing) >= SEED_COUNT:
        return [f.id for f in existing]

    if not material_ids:
        materials = _load_seeded_materials(db)
        material_ids = [m.id for m in materials]

    existing_material_ids = {f.material_id for f in existing}
    materials = _load_seeded_materials(db)
    materials_to_seed = [
        m for m in materials if m.id in material_ids and m.id not in existing_material_ids
    ][:SEED_COUNT]

    extensions = ["pdf", "docx", "pptx", "mp3", "mp4", "zip"]
    files_to_add = []
    for i, material in enumerate(materials_to_seed):
        ext = extensions[i % len(extensions)]
        files_to_add.append(
            MaterialFiles(
                material_id=material.id,
                file_name=f"{SEED_FILE_PREFIX}: {material.name.split(': ', 1)[-1]}.{ext}",
                file_path=f"/uploads/seed/materials/{material.id}/file_{i + 1:02d}.{ext}",
                file_extension=ext,
                file_size=1024 * (128 + i * 50),
            )
        )

    if files_to_add:
        db.add_all(files_to_add)
        db.flush()

    return [f.id for f in _load_seeded_files(db)]
