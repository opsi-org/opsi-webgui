from typing import Any, List, Optional

from .logger import get_logger

# from opsiconfd.logging import logger
from .utils import get_all_children_groupid

logger = get_logger()


def _get_all_parents_groupids(raw_groups: List, group_id: str) -> set[str]:
    """
    Returns all parent group IDs for a given group ID.
    """
    if not raw_groups:
        return set()

    all_parents = set()
    for row in raw_groups:
        if row["group_id"] == group_id:
            if row["parent_id"]:
                all_parents.add(row["parent_id"].lower())
                all_parents.update(
                    _get_all_parents_groupids(raw_groups, row["parent_id"])
                )
            break

    return all_parents


def _is_allowed(group_id: str, allowed: set[str] | None) -> bool:
    """
    Checks if a group ID is in the allowed list.
    """
    if not group_id:
        return True
    if not allowed:
        return True
    if group_id.lower() in list(allowed) + ["clientdirectory"]:
        return True
    return False


def _next_allowed_parent(
    parent_id: str, raw_groups: List, allowed: set[str] | None
) -> str:
    """
    Finds the next allowed parent group ID.
    """
    if not parent_id or not raw_groups:
        return None
    if _is_allowed(parent_id, allowed):
        return parent_id
    logger.info("Finding next allowed parent for %s in %s", parent_id, allowed)
    for row in raw_groups:
        if row.group_id == parent_id:
            logger.info("\tChecking parent_id: %s, allowed: %s", row.parent_id, allowed)
            if _is_allowed(row.parent_id, allowed):
                logger.info("\t\tNext allowed parent found: %s", row.parent_id)
                return row.parent_id
            return _next_allowed_parent(row.parent_id, raw_groups, allowed)
    return None


def read_groups(
    raw_groups: List,
    root_group: dict,
    selected_object_ids: List | None,
    allowed: List[str] | None,
    withClients: bool = True,
    gtype: str = "HostGroup",  # pylint: disable=invalid-name
) -> dict:
    updated_allowed = None
    if allowed:
        updated_allowed = set()
        for group_id in allowed:
            if group_id == "clientdirectory":
                continue
            updated_allowed.add(group_id)
            # currently in configed the behavior is to allow all children of the group, but not the parents (user roles)
            # updated_allowed.update(_get_all_parents_groupids(raw_groups, group_id))
            updated_allowed.update(get_all_children_groupid(raw_groups, group_id))

    if not isinstance(selected_object_ids, list) and withClients:
        selected_object_ids = []
    all_groups = {}
    for row in raw_groups:
        if not _is_allowed(row["group_id"], updated_allowed):
            logger.info("Skipping group %s, not allowed", row["group_id"])
            continue

        logger.info("Processing group: %s", row)
        if row["group_id"] not in all_groups:
            # get next allowed parent
            if _is_allowed(row["parent_id"], updated_allowed):
                parent = row["parent_id"] or root_group["id"]
            else:
                parent = _next_allowed_parent(
                    parent_id=row["parent_id"],
                    raw_groups=raw_groups,
                    allowed=updated_allowed,
                )
            all_groups[row["group_id"]] = {
                "id": f"{row['group_id']};{parent.lower()}"
                if parent
                else row["group_id"],
                "type": gtype,
                "text": row["group_id"],
                "parent": parent,
                "children": None,
            }
        if row["object_id"] and withClients:
            if _is_allowed(row["parent_id"], updated_allowed):
                parent = row["parent_id"] or root_group["id"]
            else:
                parent = _next_allowed_parent(
                    parent_id=row["parent_id"],
                    raw_groups=raw_groups,
                    allowed=updated_allowed,
                )

            if row["object_id"] in selected_object_ids:
                all_groups[row["group_id"]]["hasAnySelection"] = True
            if not all_groups[row["group_id"]].get("children"):
                all_groups[row["group_id"]]["children"] = {}
            if row.group_id == parent:
                if row["object_id"] not in all_groups:
                    all_groups[row["object_id"]] = {
                        "id": f"{row['object_id']};{parent.lower()}"
                        if parent
                        else row["object_id"],
                        "type": "ObjectToGroup",
                        "text": row["object_id"],
                        "parent": parent.lower() if parent else None,
                    }
            else:
                all_groups[row["group_id"]]["children"][row["object_id"]] = {
                    "id": f"{row['object_id']};{parent.lower()}"
                    if parent
                    else row["object_id"],
                    "type": "ObjectToGroup",
                    "text": row["object_id"],
                    "parent": row["group_id"].lower() if row["group_id"] else None,
                }
            # fixing group_id for children to ensure uniqueness
            for child in all_groups[row["group_id"]]["children"].values():
                if ";" not in child["id"] and child["parent"]:
                    child["id"] = f"{child['id']};{child['parent'].lower()}"

    return all_groups


def build_nested_group(
    current_group: dict[str, Any],
    groups: dict[str, dict[str, Any]],
    processed: Optional[dict[str, bool]] = None,
    empty_parent_group_id: str = "groups",
) -> dict[str, Any]:
    if processed is None:
        processed = {}
    processed[current_group["id"]] = True
    for group_id, group in groups.items():
        if group_id in processed:
            continue  # Skip already processed groups

        if group.get("parent") is not None and group_id != "clientdirectory":
            # Ensure the group ID is unique and formatted correctly
            if ";" not in group["id"]:
                group["id"] = f"{group['id']};{group.get('parent').lower()}"

        parent_id: Optional[str] = group.get("parent")
        if parent_id is None and group_id != "clientdirectory":
            parent_id = empty_parent_group_id
            group["parent"] = empty_parent_group_id

        if parent_id and parent_id.lower() == current_group.get("text", "").lower():
            if current_group.get("children") is None:
                current_group["children"] = {}

            current_group["children"][group_id] = group
            processed[group_id] = True

            # Rekursiver Aufruf, um Kinder der aktuellen Gruppe zu verarbeiten
            build_nested_group(group, groups, processed, empty_parent_group_id)

    return current_group
